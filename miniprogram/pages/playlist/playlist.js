// pages/playlist/playlist.js
const MAX_LIMIT = 15
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [
      // 后台管理轮播图，所以不需要写死
      //   {
      //   url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      // },
      //   {
      //     url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      //   },
      //   {
      //     url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      //   }
    ],
    playlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getPlaylist ()
    this._getSwiper()
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
  // 要先去json文件里面设置"enablePullDownRefresh": true 允许下拉
  onPullDownRefresh: function () {
    this.setData({
      playlist: []
    })
    this._getPlaylist()
    // this._getSwiper()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlaylist()
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  _getPlaylist () {
    wx.showLoading({
      title: '加载中',
    })
    // 请求云函数
    wx.cloud.callFunction({
      name: 'music',
      data: {
        // 传参去云函数
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        // tcb-router调用写法
        $url: 'playlist',
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        //本来是 playlist: res.result.data 但下拉刷新给playlist赋值要在原来条数上增加
        playlist: this.data.playlist.concat(res.result.data)
      })
      // 停止下拉刷新等待状态
      wx.stopPullDownRefresh()
      //关闭加载框
      wx.hideLoading()
    })
  },
// 后台管理轮播图
  _getSwiper () {
    db.collection('swiper').get().then((res) => {
      this.setData({
        swiperImgUrls: res.data
      })
    })
  },
})