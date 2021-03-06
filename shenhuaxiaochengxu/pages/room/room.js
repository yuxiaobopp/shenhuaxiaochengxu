// pages/room/room.js

//获取应用实例
const app = getApp();
var relineTime = 1;
var index = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 324,
    screenText: [],
    movie: null,
    cinema: "",
    userInfo: null,
    text: "",
    gifts: null,
    showGifts: false,
    showGift:false,
    prizeId:"",
    giftNum:0,
    showPrize:false,
    prizeList:null,
    showGift2:false,
    endTime:"00:00",
    leftTime:"0",
    content:"",
    unload:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    var contentHeight = windowHeight - 279;
    // console.log(app.globalData)
    this.setData({
      height: contentHeight,
      movie: app.globalData.movieRoom[app.globalData.roomNum],
      cinema: app.globalData.cinemaList[app.globalData.cinemaNo],
      userInfo: app.globalData.userInfo
    })
    wx.connectSocket({ //建立连接
      url: 'wss://app.legendpicture.com/ws/webSocket/chat/' + that.data.userInfo.roll + '/' + that.data.movie.roomName + '/' + that.data.userInfo.mobile,
      // url: 'ws://192.168.1.16:8080/ws/webSocket/chat/' + that.data.userInfo.roll + '/' + that.data.movie.roomName + '/' + that.data.userInfo.mobile,
      data: {
        // x: '',
        // y: ''
      },
      header: {
        'content-type': 'application/json',
        'Authorization': null
      },
      // protocols: ['TCP'],
      method: "GET",
      success: function(res) {
        // console.log("ok")
      },
      fail: function(res) {
        wx.showModal({
          title: '聊天室连接失败',
          content: '',
          success:function(res){
           wx.navigateBack()
          }
        })
      }
    })
    wx.onSocketOpen(function() {
      console.log("已连接")
    })
    wx.onSocketClose(function () { 
      console.log("close")
      if(!that.data.unload){
        that.reline();
      }
      
    })
    wx.onSocketError(function(res) {
      // console.log("连接已断开")
      // console.log(res)
      wx.showModal({
        title: '聊天室连接错误',
        content: '聊天室连接出现错误，请退出重进',
        success: function (res) {
          wx.navigateBack()
        },
      })
    })
    // setTimeout(function(){
    //   wx.closeSocket()
    // },2000)
    wx.onSocketMessage(function(res) {
      var message = JSON.parse(res.data)
      console.log(message)
      if (message.messageType == 1) { //发言消息
        var screen = that.data.screenText;
        var rowNum = parseInt(screen.length * Math.random());
        var id = index++;
        // console.log(id)
        var row = {};
        row.text = message.content;
        row.id = id;
        row.img = message.header;
        row.roll = message.role;
        row.time = 0.5;
        if (message.phoneOrOpenid == that.data.userInfo.mobile){
          row.self = true
        }
        if (screen[rowNum].words.length > 0){
          rowNum = parseInt(screen.length * Math.random());
          row.time = 1;
        }
        screen[rowNum].words.push(row);
        that.setData({
          screenText: screen
        })
        setTimeout(function() {
          var screen2 = that.data.screenText;
          for (var i = 0; i < screen2.length; i++) {
            for (var j = 0; j < screen2[i].words.length; j++) {
              if (screen2[i].words[j].id == id) {
                screen2[i].words.splice(screen2[i].words[j], 1)
              }
            }
          }
          that.setData({
            screenText: screen2
          })
        }, 12000)
      } else if (message.messageType == 2) { //管理员发送红包
        var id = message.prizeId.split("_")[0];
        var content = message.content;
        var giftNum = 0;
        for(var i = 0;i < that.data.gifts.gift.length;i++){
          if (that.data.gifts.gift[i].id == id){
            giftNum = that.data.gifts.gift[i].number
          }
        }
        for (var i = 0; i < that.data.gifts.ticket.length; i++) {
          if (that.data.gifts.ticket[i].id == id) {
            giftNum = that.data.gifts.ticket[i].number
          }
        }
        // console.log(message)
        that.setData({
          showGift:true,
          showGift2: true,
          content:content,
          prizeId: message.prizeId,
          giftNum:giftNum
        })
      } else if (message.messageType == 22){//实时奖品数量变化
        that.setData({
          giftNum:message.content
        })
      } else if (message.messageType == 3) {//奖品已领取
        that.setData({
          showGift: false
        })
        wx.showToast({
          title: '领取成功',
        })
      }else if (message.messageType == -3){//奖品领完了
        wx.showModal({
          title: '奖品已领完',
          content: '',
          showCancel: false,
        })
        that.setData({
          showGift: false,
          showGift2: false,
        })
      } else if (message.messageType == -2) {//房间结束
        wx.showToast({
          title: '房间已关闭',
          icon:"loading",
          duration:2000
        })
        setTimeout(function(){
           wx.switchTab({
             url: '../movie/movie',
           })
        },2000)
      } else if (message.messageType == -1) {//房间未开启
        wx.showToast({
          title: '房间未开启',
          icon: "loading",
          duration: 2000
        })
        setTimeout(function () {
          wx.switchTab({
            url: '../movie/movie',
          })
        }, 2000)
      } else if (message.messageType == 0){//其他地方登陆
        wx.showModal({
          title: '',
          content: '当前账号在其他地方进入了该聊天室',
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../movie/movie',
              })
            }
          }
        })
      } else if (message.messageType == -12){
        wx.showModal({
          title: '发送失败',
          content: '奖品库存不足',
        })
      } else if (message.messageType == -11) {
        wx.showModal({
          title: '发送失败',
          content: '该房间达到发送上限',
        })
      }

    })
    that.getGifts();
    that.getTime();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    that.setAisle();
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.setData({
      unload: true
    })
    wx.closeSocket()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

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
  setAisle: function() {
    var that = this;
    var ch = that.data.height;
    var screen = that.data.screenText;
    var aisleNum = parseInt((ch - 15) / 50);
    for (var i = 0; i < aisleNum; i++) {
      var row = {};
      row.words = [];
      screen.push(row);
    }
    that.setData({
      screenText: screen
    })
    // console.log(screen)
  },
  send: function() { //文字信息
    var that = this;
    if (that.data.text == "") {
      wx.showModal({
        title: '发送失败',
        content: '信息不能为空',
      })
      return;
    }
    var json = {
      messageType: "1",
      header: that.data.userInfo.header,
      nickName: that.data.userInfo.nickName,
      messageContent: that.data.text,
      prizeId: ""
    };
    // console.log(json)
    wx.sendSocketMessage({
      data: JSON.stringify(json),
      success: function() {
        console.log('res')
        that.setData({
          text: ""
        })
      },
      fail:function(){
        wx.showModal({
          title: '发送失败',
          content: '信息发送失败',
          success: function (res) {
            // wx.navigateBack()
          }
        })
      }

    })
    return;
  },
  setText: function(e) {
    var text = e.detail.value;
    this.setData({
      text: text
    })
  },
  getGifts: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('canSend', nowtime);
    var pageNo = that.data.pageNo;
    wx.request({
      url: app.globalData.url + '/api/chatRoom/canSend',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res)
        that.setData({
          gifts: res.data.data
        })
      }
    })
  },
  sendgift: function() {
    this.setData({
      showGifts: true
    })
  },
  close: function() {
    this.setData({
      showGifts: false
    })
  },
  sendGift: function(e) { //发放
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认发放',
      success:function(res){
        if(res.confirm){
          var id = e.currentTarget.dataset.id;
          var content = e.currentTarget.dataset.type;
          var nowtime = new Date().getTime();
          var prizeId = id + "_" + nowtime;
          var json = {
            messageType: "2",
            header: that.data.userInfo.header,
            nickName: that.data.userInfo.nickName,
            messageContent: content.toString(),
            prizeId: prizeId,

          };
          // console.log(json)
          wx.sendSocketMessage({
            data: JSON.stringify(json),
            success: function () {
              // console.log('res')
              that.setData({
                showGifts: false
              })
            },
            fail: function () {
              wx.showModal({
                title: '发送失败',
                content: '红包发送失败',
              })
            }

          })
        }
      }
    })
   
  },
  tapRed:function(){//领取红包
    var that = this;
    var json = {
      messageType: "21",
      header: that.data.userInfo.header,
      nickName: that.data.userInfo.nickName,
      messageContent: that.data.content,
      prizeId: that.data.prizeId
    };
    that.setData({
      showGift:false
    })
    if(that.data.userInfo.roll == 2){
      wx.showModal({
        title: '抢包失败',
        content: '管理员不可以抢红包哦',
      })
    }else{
      // console.log(json)
      wx.sendSocketMessage({
        data: JSON.stringify(json),
        success: function () {
          // console.log('res')

        },
        fail: function () {
          wx.showModal({
            title: '抢包失败',
            content: '领取红包失败，连接断开'
          })
        }

      })
    }
    
   
  },
  closeGift:function(){
    this.setData({
      showGift: false
    })
  },
  getPrize:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('myGift', nowtime);
    var pageNo = that.data.pageNo;
    wx.request({
      url: app.globalData.url + '/api/userGift/myGift',
      data: {
        roomName: that.data.movie.roomName,
        phone: that.data.userInfo.mobile,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if(res.data.status == 1){
          that.setData({
            prizeList:res.data.data,
            showPrize:true
          })
        }else{
          wx.showModal({
            title: '',
            content: res.data.message,
          })
        }
      }
    })
  },
  closePrzie:function(){
    this.setData({
      showPrize: false
    })
  },
  leftTime: function () {
    var that = this;
    var timer = setInterval(function () {
      var nowTime = parseInt(new Date().getTime() / 1000);
      var leftTime = parseInt(that.data.leftTime/1000) - nowTime;
      var str = "";
      var minute = parseInt(leftTime / 60);
      var second = parseInt(leftTime % 60);
      if (minute == 0 && second < 0) {
        clearInterval(timer)
        wx.switchTab({
          url: '../movie/movie',
        })
        return;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      str = minute + ":" + second;

      that.setData({
        endTime: str
      })
    }, 1000)
  },
  getTime:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('getTimestamp', nowtime);
    wx.request({
      url: app.globalData.url + '/api/chatRoom/getTimestamp',
      data: {
        roomName: that.data.movie.roomName,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        that.setData({
          leftTime: res.data.data.timestamp
        })
        that.leftTime();
      }
    })
  },
  reline:function(){
    var that = this;
    wx.showLoading({
      title: '重新连接第' + relineTime + '次',
    })
    if (relineTime > 10){
      wx.showModal({
        title: '重连失败',
        content: '聊天室连接已断开，请退出重进',
        success: function (res) {
          wx.navigateBack()
        }
      })
      return;
    }
    wx.connectSocket({ //建立连接
      url: 'wss://app.legendpicture.com/ws/webSocket/chat/' + that.data.userInfo.roll + '/' + that.data.movie.roomName + '/' + that.data.userInfo.mobile,
      data: {},
      header: {
        'content-type': 'application/json',
        'Authorization': null
      },
      method: "GET",
      success: function (res) {
        wx.hideLoading();
      },
      fail: function (res) {
        wx.hideLoading();
        relineTime++;
        that.reline();
      }
    })
  }
})