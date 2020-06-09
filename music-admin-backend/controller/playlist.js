const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB.js')
// get post  localhost:3000/playlist/list xly-7wsip
router.get('/list', async (ctx, next) => {
  // ctx.request.query方法
  // url?color=blue&size=small
  // {
  //   color: 'blue',
  //   size: 'small'
  // }
  const query = ctx.request.query
  const res = await callCloudFn(ctx, 'music', {
    $url: 'playlist',
    start: parseInt(query.start),
    count: parseInt(query.count)
  })
  let data = []
  if (res.resp_data) {
    // 返回歌单对象
    data = JSON.parse(res.resp_data).data
  }
  ctx.body = {
    data,
    // 必须有这个才能请求到
    code: 20000,
  }
})

router.get('/getById', async (ctx, next) => {
  // doc查询条件
  const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  ctx.body = {
    code: 20000,
    data: JSON.parse(res.data)
  }
})

router.post('/updatePlaylist', async (ctx, next) => {
  // router.get('/package/:aid/:cid',async (ctx)=>{
  // params 获取动态路由的传值
  // console.log(ctx.params);  //{ aid: '123', cid: '456' }
  const params = ctx.request.body
  const query = `
        db.collection('playlist').doc('${params._id}').update({
            data: {
                name: '${params.name}',
                copywriter: '${params.copywriter}'
            }
        })
    `
  const res = await callCloudDB(ctx, 'databaseupdate', query)
  ctx.body = {
    code: 20000,
    data: res
  }
})
// 删除
router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  const query = `db.collection('playlist').doc('${params.id}').remove()`
  const res = await callCloudDB(ctx, 'databasedelete', query)
  ctx.body = {
    code: 20000,
    data: res
  }
})

module.exports = router