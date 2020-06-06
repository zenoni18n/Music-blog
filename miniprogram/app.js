//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'xly-7wsip',
        traceUser: true,
      })
    }
    // 调用
    this.getOpenid()
    this.globalData = {
      playingMusicId: -1,
      openid: -1,

    }
  },
  // 用来设置当前播放歌的id 列表中高亮 防止上一首下一首歌单列表高亮没变化
  setPlayMusicId(musicId) {
    this.globalData.playingMusicId = musicId
  },
  
  getPlayMusicId() {
    return this.globalData.playingMusicId
  },
  //获取openid
  getOpenid () {
    wx.cloud.callFunction({
      name: 'login'
    }).then((res) => {
      const openid = res.result.openid
      this.globalData.openid = openid
      // 存储到本地  如果是空的，说明第一次设置存储
      if (wx.getStorageSync(openid) == '') {
        wx.setStorageSync(openid, [])
      }
    })
  },
})
