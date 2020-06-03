// 云函数入口文件
const cloud = require('wx-server-sdk')
// 云函数请求接口需要的插件
const rp = require('request-promise')
// 引入koa插件
const TcbRouter = require('tcb-router')

const BASE_URL = 'http://musicapi.xiecheng.live'
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })
  // 封装tcb-router 名为playlist，用$url:playlist使用
  app.router('playlist', async(ctx, next) => {
    // 用ctx.body返回  
    ctx.body = await cloud.database().collection('playlist')
    // event自带,是带过来的数据
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })
// 封装获取歌单列表
  app.router('musiclist', async(ctx, next) => {
    // 用ctx.body返回  字符串id转化为数字
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
      .then((res) => {
        // 转化为对象返回
        return JSON.parse(res)
      })
  })
// 封装获取歌曲的地址
  app.router('musicUrl', async(ctx, next) => {
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`).then((res) => {
      return res
    })
  })
  // 必须返回服务
  return app.serve()
  
  //     return await cloud.database().collection('playlist')
  //     .skip(event.start)
  //     .limit(event.count)
  //     .orderBy('createTime', 'desc')
  //     .get()
  //     .then((res) => {
  //       return res
  //     })
}