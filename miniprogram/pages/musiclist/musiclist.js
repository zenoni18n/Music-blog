// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 歌曲列表信息
    musiclist: [],
    // 歌单封面
    listInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
   wx.showLoading({
     title: '加载中',
   })
    wx.cloud.callFunction({
      name:"music",
      data:{
        playlistId:options.playlistId,
         $url: 'musiclist'
      }
    }).then((res)=>{
      console.log(res);
      // 具体看log台输出
      const pl = res.result.playlist
      this.setData({
        // 歌单列表在tracks里面
        musiclist: pl.tracks,
        // 歌单封面信息
        listInfo: {
          coverImgUrl: pl.coverImgUrl,
          name: pl.name,
        }
      })
      this._setMusiclist()
      wx.hideLoading()
    })
    
  },
  // 把歌单数据存储到Storage中 sync同步 ，不加异步，都可以用
  // 用缓存办法提高性能，不用反复从服务器获取数据
  _setMusiclist() {
    wx.setStorageSync('musiclist', this.data.musiclist)
  },
  
})