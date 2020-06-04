// pages/blog/blog.js
// 搜索的关键字
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 控制底部弹出层是否显示
    modalShow: false,
    blogList: [],
  },
  // 发布功能
  onPublish () {
    // 判断用户是否授权
    wx.getSetting({
      success: (res) => {
        console.log(res)
        // scope.userInfo有这个表示授权过
        if (res.authSetting['scope.userInfo']) {
          // 获取用户信息
          wx.getUserInfo({
            success: (res) => {
              // console.log(res)
              // 调用方法并把用户信息传到blog-edit里面 里面实现跳转页面
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
        } else {
          // 否则弹出授权框

          this.setData({
            modalShow: true,
          })
        }
      }
    })
  },
  // 授权成功的方法

  onLoginSuccess (event) {
    console.log(event)
    // usersinfo的信息在这里面

    const detail = event.detail
    // 并跳转到编辑页面携带用户的名字和头像

    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
    console.log(detail.nickName);
    
  },
  // 授权失败的方法

  onLoginFail () {
    // 弹框提示

    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.scene)
    // 加载数据库内容渲染到页面
    this._loadBlogList()

    // 小程序端调用云数据库 最多获取20条数据,而服务端可以100条
    // const db = wx.cloud.database()
    // db.collection('blog').orderBy('createTime', 'desc').get().then((res) => {
    //   console.log(res)
    //   const data = res.data
    //   for (let i = 0, len = data.length; i < len; i++) {
    //     data[i].createTime = data[i].createTime.toString()
    //   }
    //   this.setData({
    //     blogList: data
    //   })
    // })
  },
// 查询功能
  onSearch (event) {
    // wxml传过来的参数
    // console.log(event.detail.keyword)
    this.setData({
      // 先清空内容
      blogList: []
    })
    // 赋值 让它调用函数
    keyword = event.detail.keyword
    this._loadBlogList(0)
  },
  // 获取博客列表

  _loadBlogList (start = 0) {
    wx.showLoading({
      title: '拼命加载中',
    })
    // 调用云函数

    wx.cloud.callFunction({
      name: 'blog',
      // 调用云函数里list的方法 并传数据
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list',
      }
    }).then((res) => {
      console.log(res)
      this.setData({
        // 刷新后在原来基础上增加

        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      // 停止刷新

      wx.stopPullDownRefresh()
    })
  },
  // 点击跳转到博客详细页面

  goComment (event) {
    wx.navigateTo({
      // blogid在wxml里的data-！blogid！="{{item._id}}
      url: '../../pages/blog-comment/blog-comment?blogId=' + event.target.dataset.blogid,
    })
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
    // 先去json里面设置可以下拉刷新

    this.setData({
      // 清空

      blogList: []
    })
    // 再拉取博客数据 第0条开始取， 0可以省略，有默认值
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 第length条继续取

    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (event) {
  //   console.log(event)
  //   let blogObj = event.target.dataset.blog
  //   return {
  //     title: blogObj.content,
  //     path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
  //     // imageUrl: ''
  //   }
  // }
})