// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: 'xly-7wsip'}
)
// 先在config.json  "wxacode.getUnlimited" 开通权限
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  // 生成小程序码 cloud.openapi.wxacode.getUnlimited
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID,
    // 还没发布，不能用
    // page: "pages/blog/blog"
    // lineColor: {
    //   'r': 211,
    //   'g': 60,
    //   'b': 57},
    // 透明背景
    // isHyaline: true
  })
  // console.log(result)
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    // 二进制码
    fileContent: result.buffer
  })
  return upload.fileID

}