// components/search/search.js
// 关键字
let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '请输入关键字'
    }
  },
  externalClasses: [
    'iconfont',
    'icon-sousuo',
  ],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event) {
      // 获取到输入框的内容
      keyword = event.detail.value
    },

    onSearch() {
      // console.log(keyword)
      // blog
      // 传给blog.wxml 里面绑定search 并传参
      this.triggerEvent('search', {
        keyword
      })
    },
  }
  }

)