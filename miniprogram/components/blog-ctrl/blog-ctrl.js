// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  // wxml中传来配置
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],

  /**
   * 组件的初始数据
   */
  data: {
// 登录组件是否显示
loginShow: false,
// 底部弹出层是否显示
modalShow: false,
content: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      // 判断用户是否授权
      wx.getSetting({
        success: (res) => {
          // 有 scope.userInfo 才表示授权了
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (res) => {
                // 给userInfo赋值
                userInfo = res.userInfo
                //授权就 显示评论弹出层
                this.setData({
                  modalShow: true,
                })
              }
            })
          } else {
            this.setData({
              // 没授权就弹出授权框
              loginShow: true,
            })
          }
        }
      })
    },
    // 授权成功
    onLoginsuccess(event) {
      userInfo = event.detail
      // 授权框消失，评论框显示  setData的第二种方法,会按顺序
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
    },
// 授权失败 这个方法是login组件传到ctrl.wxml然后再调用的
    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: '',
      })
    },
    // 发送评论
    onSend(event) {
      console.log(event)
      // 插入数据库
      // 获取formid 也是表单自带 用于发送模板消息
      // let formId = event.detail.formId
      // 获取评论弹框的内容  用form表单提交后event里面自带内容
      let content = event.detail.value.content
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        // 蒙版
        mask: true,
      })
      // 数据添加到数据库
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          // 对应博客的id
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          // 头像
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) => {
        // 推送模板消息
//          wx.requestSubscribeMessage({
//           tmplIds: ['IHUD21KOrwujIljSh5eF2_GNHupXwf_VFm5Gb_qXsCE'],
//           success: (res) =>{
//             wx.cloud.callFunction({
//               name: 'sendMessage',
//               data: {
//                 content,
//                 // formId,
//                 // 获取别的地方传来的值
//                 blogId: this.properties.blogId
//               }
//             }).then((res) => {
//               console.log(res)
//             })
//            }
// })
      })
       

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          // 关闭评论框,清空消息
          modalShow: false,
          content: '',
        })

        // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      }
    },
  }
)
