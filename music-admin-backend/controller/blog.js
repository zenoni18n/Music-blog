const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')

router.get('/list', async(ctx, next)=>{
    const params = ctx.request.query
    const query = `
        db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()
    `
    const res = await callCloudDB(ctx, 'databasequery', query)
    ctx.body = {
        code: 20000,
        data: res.data
    }

})

router.post('/del', async(ctx, next)=>{
    const params = ctx.request.body
    // 删除blog
    const queryBlog = `db.collection('blog').doc('${params._id}').remove()`
    const delBlogRes = await callCloudDB(ctx, 'databasedelete', queryBlog)
    
    // 删除blog-comment
    const queryComment = `db.collection('blog-comment').where({
        blogId: '${params._id}'
    }).remove()`
    const delCommentRes = await callCloudDB(ctx, 'databasedelete', queryComment)
    
    // 删除图片
    const delStorageRes = await cloudStorage.delete(ctx, params.img)
    ctx.body = {
        code: 20000,
        data: {
            delBlogRes,
            delCommentRes,
            delStorageRes
        }
    }

})

module.exports = router
