// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'xly-7wsip'
})
// 要发送模板得去config.json文件配置 "templateMessage.send"
// 云函数入口函数
exports.main = async (event, context) => {
  // const {
  //   OPENID
  // } = cloud.getWXContext()
  const wxContext = cloud.getWXContext()

  const result = await cloud.openapi.customerServiceMessage.send({
    
    touser: wxContext.OPENID,
    // 打开模板显示哪条博客
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      // 具体看模板详情
      phrase1: {
        value: '评价完成'
      },
      thing2: {
        // 从发送页面获取评论内容
        value: event.content
      }
    },
    // 模板id
    templateId: 'IHUD21KOrwujIljSh5eF2_GNHupXwf_VFm5Gb_qXsCE',
    // 表单的id
    // formId: event.formId
  })
  return result
}