// components/musiclist/musiclist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 接收pages里musiclist里传来的值
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 初始化，方便在wxml里面判断，达到选择后变红效果
    playingId: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
 // 事件源 事件处理函数 事件对象 事件类型
       // console.log(event)
      // console.log(event.currentTarget.dataset.musicid)
      // currentTarget是在有绑定事件的组件的信息 Target则是点击的组件的信息
      //冒泡
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        // id知道哪个歌，index知道歌的索引，方便从缓存中取出来
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})
