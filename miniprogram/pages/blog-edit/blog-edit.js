// 输入文字最大的个数
const MAX_WORDS_NUM = 140
// 最大上传图片数量
const MAX_IMG_NUM = 9
// 初始化数据库
const db = wx.cloud.database()
// 输入的文字内容
let content = ''
// 存储用户信息 
let userInfo = {}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 输入的文字个数
    wordsNum: 0,
    // footter距离底部的高度
    footerBottom: 0,
    // 存放图片
    images: [],
    selectPhoto: true, // 添加图片元素是否显示
  },
  // 加载完获取页面自带的用户信息传到userInfo  好让后面一并传到数据库
  onLoad: function (options) {
    console.log(options)
    userInfo = options
  },
  // textarea事件
  onInput(event) {
    // console.log(event.detail.value)
    // 获取当前字数长度
    let wordsNum = event.detail.value.length
    // 如果等于或者多了，就提示
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    // 把文字内容赋值 好让后面一并传到数据库
    content = event.detail.value
  },
  // 获取焦点
  onFocus(event) {
    // 模拟器获取的键盘高度为0
    // console.log(event)
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  // 选择图片
  onChooseImage() {
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      // 还能选几张
      count: max,
      // 图片类型 初始和压缩过的
      sizeType: ['original', 'compressed'],
      // 源头  相册/拍摄
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log(res)
        this.setData({
          //不覆盖已选的图片，基础上追加  添加图片地址
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          // 选满了，就false不显示添加图片
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  // 删除图片
  onDelImage (event) {
    // 先切割掉对应下标的图片 改变原数组
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    // 长度小于8就显示添加图片
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  // 预览图片事件
  onPreviewImage (event) {
    // ios上面会显示图片页数 6/9 
    // 小程序自带 
    wx.previewImage({
      // 图片集合的数组
      urls: this.data.images,
      // 在wxml中设置data-imgsrc 
      // 传入图片地址
      current: event.target.dataset.imgsrc,
    })
  },
  send () {
    // 1、图片 -> 云存储 fileID 云文件ID
    // 2、数据 -> 云数据库
    // 数据库：内容、图片fileID、openid、昵称、头像、时间
    
    // 判断文字为空吗
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      // 蒙版，可以遮住
      mask: true,
    })

    // promise集合 用来Promise.all()
    let promiseArr = []
    // 图片id
    let fileIds = []
    // 图片上传 api每次只能上传一张，所以要循环
    for (let i = 0; i < this.data.images.length; i++) {
      // 每次循环创建一个Promise对象并push到集合promiseArr里面
      let p = new Promise((resolve, reject) => {
        // item是图片地址 上面添加图片事件push进去的
        let item = this.data.images[i]
        // 文件扩展名  \.表示. 字母数字下划线多个结束 exec() 方法用于检索字符串中的正则表达式的匹配
        let suffix = /\.\w+$/.exec(item)[0]
      //  ！！！！！！！！！上传！！！！！！！！！！！！！！
        wx.cloud.uploadFile({
          // 每次上传不一样的才不会覆盖掉 相同文件名会被覆盖掉
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID)
            // 把全部图片id赋值给它 好让一并传到数据库
            fileIds = fileIds.concat(res.fileID)
            // promise成功
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      // 循环完一次就push进去
      promiseArr.push(p)
    }
    // 存入到云数据库  等到Promise全部执行完
    Promise.all(promiseArr).then((res) => {
      // 上传到数据库
      db.collection('blog').add({
        data: {
          // userInfo每个属性都传  有用户名称和头像
          ...userInfo,
          // 文字内容
          content,
          // 图片id
          img: fileIds,
          createTime: db.serverDate(), // 服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面，并且刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        // console.log(pages)
        // 取到上一个页面  !!!取到父页面 并调用父页面的方法!!!
        const prevPage = pages[pages.length - 2]
        // 调用父页面的方法
        prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
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