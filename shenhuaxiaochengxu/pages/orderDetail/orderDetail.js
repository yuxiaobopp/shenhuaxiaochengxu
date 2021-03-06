// pages/orderDetail/orderDetail.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum:0,
    order: null,
    retreat:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderNum:options.orderNum
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('orderDetail', nowtime);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/api/shOrder/orderDetail',
      data: {
        appUserId: app.globalData.userInfo.id,
        orderNum:that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        if(res.data.data.order != null){
          var order = res.data.data;
          var seats = order.order.seats.split(",");
          var seatsJson = [];
          for(var i = 0;i < seats.length;i++){
            var row = {};
            row.name = seats[i];
            seatsJson.push(row)
          }
          order.order.seats = seatsJson;
          that.setData({
            order: order
          })
        }else{
          that.setData({
            order: res.data.data
          })
        }
        wx.hideLoading()
      }
    })
  },
  phone:function(e){
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
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
  refund:function(){
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('refund', nowtime);
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/api/shOrder/refund',
      data: {
        id:that.data.order.id,
        orderNum: that.data.orderNum,
        appUserId: app.globalData.userInfo.id,
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
          retreat:false
        })
        if(res.data.status == 1){
          that.setData({
            order: res.data.data
          })
          wx.showToast({
            title: '退票成功',
          })
          that.syn();
         
        }else{
          wx.showModal({
            title: '退款失败',
            content: res.data.message,
          })
        }
        wx.hideLoading();
      }
    })
  },
  cancel:function(){
    this.setData({
      retreat:false
    })
  },
  refundbtn:function(){
    this.setData({
      retreat: true
    })
  },
  syn: function () {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('userCard', nowtime);
    wx.showLoading({
      title: '同步中',
    })
    wx.request({
      url: app.globalData.url + '/api/shAppuser/userCard',
      data: {
        appUserId: app.globalData.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res)
        wx.hideLoading();
        if (res.data.status == 1) {
          var userInfo = res.data.data;
          that.setData({
            userInfo: userInfo
          })
          app.globalData.userInfo = userInfo;
          setTimeout(function () {
            wx.switchTab({
              url: '../mine/mine',
            })
          }, 2000)
        } else {
          wx.showModal({
            title: '',
            content: res.data.message
          })
        }
      }
    })
  },
})