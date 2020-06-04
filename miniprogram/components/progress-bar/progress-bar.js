// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0

// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

let currentSec = -1 // 初始化当前的秒数 方便后面判断，达到优化效果

let duration = 0 // 当前歌曲的总时长，以秒为单位

let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 接收palyer.wxml里传来的，用来判断是不是同首歌曲
    isSame: Boolean
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
  // 组件中放生命周期的
  lifetimes: {
    //组件页面(dom)渲染后完成
    ready() {
      // 同首歌曲进去页面会重新渲染，但是时间没有
      //同首歌曲和时间显示为00.00就重新赋值时间，小bug！
      if (this.properties.isSame && this.data.showTime.totalTime == '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },
  
  methods: {
    onChange(event) {
      // console.log(event)
      // 拖动 如果不是拖动里面的source就为' '
      if (event.detail.source == 'touch') {
        // x是圆点离左边的距离  算出来是进度条白色的长度
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        // movableDis是圆点离左边的距离 x="{{movableDis}}"
        this.data.movableDis = event.detail.x
        // 正在拖动，设为true
        isMoving = true
        // console.log('change', isMoving)
      }
    },
    // 拖拉松手的时候
    onTouchEnd() {
      // 取到当前播放时间转为分秒
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
      })
      // 音乐自带的接口  想播放到几秒 参数seek(1000) 为秒数 1000
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      // 拖动结束后，设为false
      isMoving = false
      // console.log('end', isMoving)
    },
    // 获取宽度 设备不一样，宽度不一样
  _getMovableDis(){
    // 获取dom元素
    const query = this.createSelectorQuery()
    // 可移动区域的宽度
    query.select('.movable-area').boundingClientRect()
    // 圆点的宽度
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
        // 在停止拖拉的时候会有小bug，isMoving会打开，所以要禁掉，防止出问题 (组件优化)
        isMoving = false
        // 控制面板联动，开始播放，传事件去改变isplaying
        this.triggerEvent('musicPlay')
      })
      // 停止播放事件
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      // 暂停播放事件
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        // 控制面板联动，开始播放，传事件去改变isplaying
        this.triggerEvent('musicPause')
      })
      // 拉动进度条加载中的事件
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      // 能够播放 的时候就执行 获取到歌曲地址
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay') 
        // console.log(backgroundAudioManager.duration)
        //解决偶尔出现undefined  bug的情况 小程序的坑 
        if (typeof backgroundAudioManager.duration != 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      // 监听播放进度 前台有效 后台没用 秒数变化就发生
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        // 还在拖动的时候，还是会发生onTimeUpdate事件，里面的setData和onTouchEnd里面的setData冲突
        //所以用isMoving控制(性能优化)！ ！没在移动的时候 ！！
        if (!isMoving) {
          // 当前已播放时间
          const currentTime = backgroundAudioManager.currentTime
          // console.log(backgroundAudioManager.currentTime);
          //播放总时长
          const duration = backgroundAudioManager.duration
          // 秒数 currentTime会一秒出现4次，所以要控制次数
          const sec = currentTime.toString().split('.')[0]
          // 当前currentTime的秒数如果不等于currentSec，就把时间格式化并赋值给currentSec
          if (sec != currentSec) {
            // console.log(currentTime)
            // 格式化时间
            const currentTimeFmt = this._dateFormat(currentTime)
            this.setData({
              // 圆点移动的刻度  (movableAreaWidth - movableViewWidth) 防止不同机型不同，相当于100
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              // 进度条刻度(白色)
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
            })
            // 给设置的秒数赋值
            currentSec = sec
            // 联动歌词 把currentTime播放时长传给 父级 pages里的player.wxml
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })
      // 播放结束事件
      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        // 组件给pages传事件，在player.wxml 中绑定bind:musicEnd="onNext" 自动下一首歌
        this.triggerEvent('musicEnd')
      })
      // 播放错误的情况
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    _setTime() {
      // 时长 全局 让70行能够使用
      duration = backgroundAudioManager.duration
      // 把duration时长传给函数处理时间 原本为总秒数
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
        // 返回给上面的durationFmt
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
