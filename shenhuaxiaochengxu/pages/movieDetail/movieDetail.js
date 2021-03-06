// pages/movieDetail/movieDetail.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isWant:false,
    isLooked:false,
    isAll:false,
    movie:null,
    canTap:"1",
    comments:null,
    watchRecord:"0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // console.log(app.globalData.movieIndex)
    var that = this;
    var movie = app.globalData.movieList[app.globalData.movieIndex];
    var event = movie;
    that.manage(event);
    // console.log(app.globalData)
    var nowtime = new Date().getTime();
    var sign = app.createMD5('myComment', nowtime);
    wx.request({
      url: app.globalData.url+'/api/Comment/myComment',
      data:{
        movieId: that.data.movie.id,
        appUserId:app.globalData.userInfo.id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        // console.log(res)
        that.setData({
          isWant: res.data.data.wantSee,
          isLooked: res.data.data.commentRecord,
          watchRecord: res.data.data.watchRecord
        })
        that.getComment();
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  manage:function(event){
    var that = this;
    var movie = event;
    movie.startPlay = movie.startPlay.substring(0,10);
    if (typeof (movie.photos) == "string"){
      movie.photos = movie.photos.split(",");
    }
    
    // console.log(movie)
    that.setData({
      movie:movie
    })
  },
  seeAll:function(){//查看全部介绍
    var that = this;
    if(that.data.isAll){
      that.setData({
        isAll:true
      })
    }else{
      that.setData({
        isAll: false
      })
    }
  },
  wantSee:function(){//想看按钮
    var that = this;
    if (that.data.canTap == "1") {
      that.setData({
        canTap: "0"
      })
      if (that.data.isWant == 0) {
        that.setData({
          isWant: 1
        })
      } else {
        that.setData({
          isWant: 0
        })
      }
      var nowtime = new Date().getTime();
      var sign = app.createMD5('saveWantSee', nowtime);
      wx.request({
        url: app.globalData.url+'/api/Comment/saveWantSee',
        data:{
          appUserId: app.globalData.userInfo.id,
          movieId: that.data.movie.id,
          wantSee:that.data.isWant,
          timeStamp: nowtime,
          mac: sign
        },
        method: "POST",
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        success:function(res){
          // console.log(res);
          that.setData({
            canTap: "1"
          })
        }
      })
    } 
  },
  getComment:function(){//获取评论列表
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('commentList', nowtime);
    wx.request({
      url: app.globalData.url+'/api/Comment/commentList',
      data: {
        movieId: that.data.movie.id,
        pageNo:"1",
        pageSize: "3",
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        // console.log(res);
        that.setData({
          comments:res.data.data
        })
      }
    })
  },
  praiseComment:function(e){//评论点赞
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('upvote', nowtime);
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.url+'/api/movie/comment/upvote',
      data: {
        appUserId:app.globalData.userInfo.id,
        id: id,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        var newComment = that.data.comments;
        for (var i = 0; i < newComment.length;i++){
          if (newComment[i].id == id){
            newComment[i].upvoteNum = res.data.data.upvoteNum;
            newComment[i].upvoteStatus = res.data.data.upvoteStatus;
          }
        }
        that.setData({
          comments: newComment
        })
      }
    })
  },
  toCompare:function(){
    app.globalData.movieId = app.globalData.movieList[app.globalData.movieIndex].id;
    wx.navigateTo({
      url: '../compare/compare',
    })
  },
  toComments:function(){
    var id = app.globalData.movieList[app.globalData.movieIndex].id;
    wx.navigateTo({
      url: '../compare/compare?id='+id,
    })
  },
  looked:function(){
    var that = this;
    if(that.data.watchRecord == 0){
      wx.showModal({
        title: '',
        content: '您还没有看过该影片哦',
      })
    }else{
      if(that.data.commentRecord == 0){
        wx.navigateTo({
          url: '../commentmovie/commentmovie?movieId='+that.data.movie.id,
        })
      }else{
        wx.showModal({
          title: '',
          content: '您已经评论过该影片哦',
        })
      }
    }
  }

})