// components/lyric/lyric.js
let lyricHeight = 0

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // player传过来的值
    isLyricShow: {
      type: Boolean,
      value: false,
    },
    lyric: String,
  },
  observers:{
     // 监听到lyric发生变化
    lyric(lrc) {
      // 如果player.js穿过来的数据是暂无歌词
    if (lrc == '暂无歌词') {
      this.setData({
        lrcList: [{
          lrc,
          time: 0,
        }],
        // 初始化为-1
        nowLyricIndex: -1
      })
    } else {
      // console.log(lrc);
       // 调用解析歌词方法并把player带过来的歌词数据传给方法
      this._parseLyric(lrc)
    }
    // console.log(lrc)
  },
 
  },
  data: {
    lrcList: [],
    nowLyricIndex: 0, // 当前选中的歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
  },
  // 组件里放生命周期的写法
  lifetimes: {
    ready() {
      // 750rpx 获取设备信息
      wx.getSystemInfo({
        success(res) {
          // console.log(res)
          // 求出1rpx的大小 =屏幕宽度(px)/750*64
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    },
  },
  methods: {
    update(currentTime) {
      // console.log(currentTime)
      // 获取数据里的歌词
      let lrcList = this.data.lrcList
      // 如果没歌词就返回
      if (lrcList.length == 0) {
        return
      }
     // 如果当前时间大于最后一句歌词的时间
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
           // 就高亮最后一句
            nowLyricIndex: -1,
            // 滚动到最后一句歌词
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
       // 当前播放时间<=lrcList的时间[0]歌词[1]时间
      for (let i = 0;i < lrcList.length; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            // 歌词高亮
            nowLyricIndex: i - 1,
            // 滚动一行歌词的高度
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      // 切割歌词换行 部分
      let line = sLyric.split('\n')
      // console.log(line)
      let _lrcList = []
      line.forEach((elem) => {
        // 匹配到前面的时间部分
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time != null) {
          // 把时间部分切割取数组[1]部分也就是纯歌词
          let lrc = elem.split(time)[1]
          // 把[00：00.000]切割成00：00.000 方便时间到哪就那里高亮
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeReg) ['0':00：00.000,'1':'00','2':'00']
          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            // 把歌词，时间存储起来,然后下面再setData 
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
