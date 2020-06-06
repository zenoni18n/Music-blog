// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter=require('tcb-router')

const db=cloud.database()
//  获取数据库
const blogCollection = db.collection('blog')

const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  // 封装获取帖子列表
  app.router('list', async(ctx, next) => {
    // 把穿过来的关键词赋值
    const keyword = event.keyword
    // 传搜索方式
    let w = {}
    // 判断有没有关键词,有就说明是搜索功能
    if (keyword.trim() != '') {
      w = {
        // 数据库自带的正则 模糊查询
        content: new db.RegExp({
          // 查询的内容
          regexp: keyword,
          // 不区分大小写
          options: 'i'
        })
      }
    }
    // 按照时间逆序返回
    let blogList = await blogCollection.where(w).skip(event.start).limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })
    ctx.body = blogList
  })

  app.router('detail', async (ctx, next) => {
    // 接收传过来的id
    let blogId = event.blogId
    // 详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    // 评论查询
    const countResult = await blogCollection.count()
    // 取到评论数量
    const total = countResult.total
    let commentList = {
      data: []
    }
    if (total > 0) {
      // 一共要取几次
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({
            blogId
          }).orderBy('createTime', 'desc').get()
          // 每次取完push到tasks里
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            // 等任务都执行完就一次添加进去
            data: acc.data.concat(cur.data)
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail,
    }

  })
  // 查询发布过的博客
// 云函数自带 
  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async (ctx, next) => {
    ctx.body = await blogCollection.where({
      _openid: wxContext.OPENID
    }).skip(event.start).limit(event.count)
      .orderBy('createTime', 'desc').get().then((res) => {
        return res.data
      })
  })

  return app.serve()
}