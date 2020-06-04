// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // login传过来的
    modalShow: Boolean
  },
  // 组件默认自带隔离(组件隔离)
  options: {
    // 全局样式可以影响组件 更多看文档
    styleIsolation: 'apply-shared',
    // 控制要不要多个插槽 设置了才能起作用
    multipleSlots: true,
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
    // 关闭弹出
    onClose() {
      this.setData({
        modalShow: false,
      })
    },
  }
})
