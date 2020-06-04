// components/musiclist/musiclist.js
// 获取全局
const app =getApp()
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
  // 页面的生命周期
  pageLifetimes: {
    // 页面显示的时候
    show () {
      this.setData({
        // 调用全局中getPlayMusicId方法取到id
        // !parseInt解决bug, pages里的musicilist.js传过来是String类型，所以在wxml比较的时候会冲突，不高亮，所以要转换
        playingId: parseInt(app.getPlayMusicId())
      })

    }
  },
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
