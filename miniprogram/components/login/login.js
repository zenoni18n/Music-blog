// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 接收blog传过来的，准备传给bottom-modal让他显示
    modalShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event) {
      console.log(event)
      // 有这个信息表示已经授权
      const userInfo = event.detail.userInfo
      // 允许授权
      if (userInfo) {
        this.setData({
          // 不再显示弹框
          modalShow: false
        })
        // 授权成功把userInfo传到父组件调用loginsuccess方法 给blog.wxml
        this.triggerEvent('loginsuccess', userInfo)
      } else {
        // 授权失败就传loginsuccess方法 给blog.wxml
        this.triggerEvent('loginfail')
      }
    }
  }
})
