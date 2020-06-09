const rp = require('request-promise')
const APPID = 'wxdc5bebf859c04024'
const APPSECRET = '8945bac71425288e82e57d0e3a94f13a'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fs = require('fs')
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')

const updateAccessToken = async () => {
  const resStr = await rp(URL)
  const res = JSON.parse(resStr)
  console.log(res)
  // 写文件
  if (res.access_token) {
    fs.writeFileSync(fileName, JSON.stringify({
      access_token: res.access_token,
      createTime: new Date()
    }))
  } else {
    // 可能服务器错误，重新运行一遍
    await updateAccessToken()
  }
}

const getAccessToken = async () => {
  // 读取文件
  try {
    const readRes = fs.readFileSync(fileName, 'utf8')
    const readObj = JSON.parse(readRes)
    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    // 时间差超过两小时，说明token过期了，重新运行一遍
    if ((nowTime - createTime) / 1000 / 60 / 60 >= 2) {
      await updateAccessToken()
      await getAccessToken()
    }
    return readObj.access_token
  } catch (error) {
    // 服务器可能断开，重新运行
    await updateAccessToken()
    await getAccessToken()
  }
}
// 定时器，2小时过期，提前五分钟刷新
setInterval(async () => {
  await updateAccessToken()
}, (7200 - 300) * 1000)

// updateAccessToken()
// console.log(getAccessToken())
module.exports = getAccessToken
