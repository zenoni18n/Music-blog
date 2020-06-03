// pages/player/player.js

// musiclist不用于界面渲染，所以不需要写在data里面
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, // false表示不播放，true表示正在播放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // components 中musiclist传过来的数据 id和index
    console.log(options);
    nowPlayingIndex = options.index
    // 获取Storage中key为musiclist的数据
    musiclist = wx.getStorageSync('musiclist')
    // 把id传给方法
    this._loadMusicDetail(options.musicId)
      },
  _loadMusicDetail(musicId){
    // 切换下一首上一首时候调用方法把歌停止播放
    backgroundAudioManager.stop()
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    // 设置标题
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      // 刚进来状态不播放
      isPlaying: false,
    })
    // 提示
    wx.showLoading({
      title: '歌曲加载中',
    })
    // 调用云函数music方法 ，带id传过去
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then((res) => {
      console.log(res)
      console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      // 退出小程序是否在后台播放  在全局json中设置 "requiredBackgroundModes": [ "audio"] 就不会报错
      // 播放器播放地址
      backgroundAudioManager.src = result.data[0].url
      //得设置title ，不然会报错
      backgroundAudioManager.title = music.name
      
        // 获取到歌曲信息播放，就开打true
        this.setData({
          isPlaying: true
        })
        // 加载完隐藏掉
        wx.hideLoading()
    })

    
  },
  
  togglePlaying () {
    // 正在播放
    if (this.data.isPlaying) {
      // 暂停方法 自带
      backgroundAudioManager.pause()
    } else {
      // 继续播放 自带
      backgroundAudioManager.play()
    }
    this.setData({
      // 控制isPlaying
      isPlaying: !this.data.isPlaying
    })
  },
  // 上一首
  onPrev () {
    nowPlayingIndex--
    // 播放第一首的时候点上一首跳到歌单最后一首
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext () {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})