const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')

router.get('/list', async (ctx, next) => {
  // 默认10条数据
  const query = `db.collection('swiper').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  console.log(res)
  // 文件下载链接
  let fileList = []
  const data = res.data
  //  官方格式
  // "file_list": [
  //   {
  //     "fileid":"cloud://test2-4a89da.7465-test2-4a89da/A.png",
  //     有效时间
  //     "max_age":7200
  //   }
  for (let i = 0, len = data.length; i < len; i++) {
    fileList.push({
      fileid: JSON.parse(data[i]).fileid,
      max_age: 7200
    })
  }
  const dlRes = await cloudStorage.download(ctx, fileList)
  console.log(dlRes)
  let returnData = []
  // 返回到前端让遍历
  for (let i = 0, len = dlRes.file_list.length; i < len; i++) {
    returnData.push({
      download_url: dlRes.file_list[i].download_url,
      fileid: dlRes.file_list[i].fileid,
      _id: JSON.parse(data[i])._id
    })
  }
  ctx.body = {
    code: 20000,
    data: returnData
  }
})


// 上传
router.post('/upload', async (ctx, next) => {
  const fileid = await cloudStorage.upload(ctx)
  console.log(fileid)
  // 写数据库
  const query = `
        db.collection('swiper').add({
            data: {
                fileid: '${fileid}'
            }
        })
    `
  const res = await callCloudDB(ctx, 'databaseadd', query)
  ctx.body = {
    code: 20000,
    id_list: res.id_list
  }
})

router.get('/del', async (ctx, next) => {
  const params = ctx.request.query
  // 删除云数据库中的内容
  const query = `db.collection('swiper').doc('${params._id}').remove()`
  const delDBRes = await callCloudDB(ctx, 'databasedelete', query)

  // 删除云存储中的文件
  const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
  ctx.body = {
    code: 20000,
    data: {
      delDBRes,
      delStorageRes,
    }
  }
})

module.exports = router