// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: Object
  },
  // 监听器
  observers: {
    // 对象中属性的用法
    ['playlist.playCount'] (count) {
      this.setData({
        // 播放数量 保存小数点后2位
        // ['playlist.playCount']: this._tranNumber(count, 2) 这样的话会死循环，因为
        // ['playlist.playCount']一直在变化
        _count: this._tranNumber(count, 2)
      })

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _count: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goToMusiclist(){
      wx.navigateTo({
        // 携带参数id跳转到音乐列表
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
       
      })
    },
    // 播放数量计算
    _tranNumber (num, point) {
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) +
          '万'
      } else if (numStr.length > 8) {
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})
