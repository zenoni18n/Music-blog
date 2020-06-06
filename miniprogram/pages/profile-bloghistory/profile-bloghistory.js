// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this._getListByCloudFn()
    this._getListByMiniprogram()
  },
    // 云调用的方法
  // _getListByCloudFn() {
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   wx.cloud.callFunction({
  //     name: 'blog',
  //     data: {
  //       $url: 'getListByOpenid',
  //       start: this.data.blogList.length,
  //       count: MAX_LIMIT
  //     }
  //   }).then((res) => {
  //     console.log(res)
  //     this.setData({
  //       blogList: this.data.blogList.concat(res.result)
  //     })

  //     wx.hideLoading()
  //   })
  // },

  // 小程序方法
  _getListByMiniprogram() {
    wx.showLoading({
      title: '加载中',
    })
    db.collection('blog').skip(this.data.blogList.length)
      .limit(MAX_LIMIT).orderBy('createTime', 'desc').get().then((res) => {
        console.log(res)
        let _bloglist = res.data
        for (let i = 0, len = _bloglist.length; i < len; i++) {
          // 把时间变为字符串解决了时间显示NAN的bug
          _bloglist[i].createTime = _bloglist[i].createTime.toString()
        }
        this.setData({
          blogList: this.data.blogList.concat(_bloglist)
        })
        wx.hideLoading()
      })

  },

  goComment(event) {
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    // this._getListByCloudFn()
    this._getListByMiniprogram()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    const blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})