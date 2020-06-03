// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0

// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

let currentSec = -1 // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      // 当前播放时间
      currentTime: '00:00',
      // 总时间
      totalTime: '00:00',
    },
    // 移动距离 
    movableDis: 0,
    progress: 0,
  },
  lifetimes: {
    //组件页面(dom)渲染后完成
    ready() {
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },
  
  methods: {
    // 获取宽度 设备不一样，宽度不一样
  _getMovableDis(){
    const query = this.createSelectorQuery()
    query.select('.movable-area').boundingClientRect()
    query.select('.movable-view').boundingClientRect()
    query.exec((rect) => {
      // console.log(rect)
      movableAreaWidth = rect[0].width
      movableViewWidth = rect[1].width
      // console.log(movableAreaWidth, movableViewWidth)
    })

  },
    _bindBGMEvent() {
      // 播放事件
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        // isMoving = false
        // this.triggerEvent('musicPlay')
      })
      // 停止播放事件
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      // 暂停播放事件
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        // this.triggerEvent('musicPause')
      })
      // 拉动进度条加载中的事件
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      // 能够播放
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // console.log(backgroundAudioManager.duration)
        //解决偶尔出现undefined  bug的情况
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      // 监听播放进度 前台有效 后台没用
      // backgroundAudioManager.onTimeUpdate(() => {
      //   // console.log('onTimeUpdate')
      //   if (!isMoving) {
      //     const currentTime = backgroundAudioManager.currentTime
      //     const duration = backgroundAudioManager.duration
      //     const sec = currentTime.toString().split('.')[0]
      //     if (sec != currentSec) {
      //       // console.log(currentTime)
      //       const currentTimeFmt = this._dateFormat(currentTime)
      //       this.setData({
      //         movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
      //         progress: currentTime / duration * 100,
      //         ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
      //       })
      //       currentSec = sec
      //       // 联动歌词
      //       this.triggerEvent('timeUpdate', {
      //         currentTime
      //       })
      //     }
      //   }
      // })
      // 播放结束事件
      // backgroundAudioManager.onEnded(() => {
      //   console.log("onEnded")
      //   this.triggerEvent('musicEnd')
      // })
      // 播放错误的情况
      // backgroundAudioManager.onError((res) => {
      //   console.error(res.errMsg)
      //   console.error(res.errCode)
      //   wx.showToast({
      //     title: '错误:' + res.errCode,
      //   })
      // })
    },
    _setTime() {
      // 时长
      duration = backgroundAudioManager.duration
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec),
      }
    },
    // 补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
