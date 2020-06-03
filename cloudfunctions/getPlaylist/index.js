// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 初始化数据库
const db = cloud.database()
// 云函数发送请求插件
const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

// 公共集合
const playlistCollection = db.collection('playlist')
// 一次要除的个数
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取数据库内容  数据库已经有的数据
  // const list = await playlistCollection.get() 只能获取20条，有限制
  // 获取数据总条数 是个对象
  const countResult = await playlistCollection.count()
  // 取到数量
  const total = countResult.total
  // 需要执行的次数 210/100=2.1 所以取三次
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 放promise集合
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    // skip是从第几条开始取 210条就 0到100 100到200 200到210
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
   //  添加到数组里
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    // 迭代累积数据
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  // 获取api的内容  服务器的数据
  const playlist = await rp(URL).then((res) => {
    // 把数据转为json并取result的内容
    return JSON.parse(res).result
  })
  // 进行去重
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    // 判断是否重复 
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        // 重复了,false关掉,退出本次循环
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }


  for (let i = 0; i < newData.length; i++) {
    // 循环插入 一个一个插入，得用await
    await playlistCollection.add({
      data: {
        // 插入到数据库
        ...newData[i],
        // 创建时间
        createTime: db.serverDate()
      }
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log('插入失败');

    })
  }
  return newData.length
}
