// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    inputPhone: "",
    inputYzm: "",
    yzmText: "获取验证码",
    yzmTime: "60"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var dataInfo = app.globalData;
    var that = this;
    that.setData({
      userInfo: dataInfo.userInfo
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
  onShareAppMessage: function() {
    return {
      title: '神画电影',
      path: '/pages/index/index'
    }
  },
  login: function() {
    // console.log("login")
    var phone = this.data.phone;
    var yzm = this.data.inputYzm;
    var that = this;
    if (!(/^1\d{10}$/.test(phone))) {
      wx.showModal({
        title: '提示',
        content: '手机号码错误！',
      })
      return;
    }

    if (yzm.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请填写验证码！',
      })
      return;
    }
    wx.showLoading({
      title: '请稍等',
    })
    var nowtime = new Date().getTime();
    var sign = app.createMD5('shRegister', nowtime);
    wx.request({
      url: app.globalData.url + '/shDistributor/shRegister',
      data: {
        verification: yzm,
        phone: phone,
        appUserId: that.data.userInfo.id,
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        timeStamp: nowtime,
        apikey: 'HLBW2018SHAPPLET',
        mac: sign
      },
      success: function(res) {
        // console.log(res)
        wx.hideLoading()
        if (res.data.status == 1) {
          if (res.data.data.alertPhoto){
            wx.setStorage({
              key: 'zchb',
              data: res.data.data.alertPhoto,
              success:function(){
                wx.switchTab({
                  url: '../index/index?url=' + res.data.data.alertPhoto,
                })
              }
            })
           
          }else{
            wx.switchTab({
              url: '../index/index',
            })
          }
         
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'loading',
            image: '',
            duration: 2000,
            mask: true,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
        }

      }
    })
    // console.log(phone+yzm)

  },
  phoneCut: function(e) { //手机号长度校验
    var text = e.detail.value;
    if (text.length > 11) {
      text = text.slice(0, 11);
    }
    this.setData({
      inputPhone: text,
      phone: text
    })
  },
  yzmCut: function(e) { //验证码长度校验
    var text = e.detail.value;
    if (text.length > 6) {
      text = text.slice(0, 6);
    }
    this.setData({
      inputYzm: text
    })
  },
  sendYzm: function() {
    var phone = this.data.phone;
    var that = this;
    if (that.data.yzmText == "获取验证码") {
      //手机号验证
      if (!(/^1\d{10}$/.test(phone))) {
        wx.showModal({
          title: '提示',
          content: '手机号码错误！',
        })
        return;
      }
      that.setData({
        yzmText:"正在发送"
      })
      //发送请求获取验证码
      // console.log(phone)
      var nowtime = new Date().getTime();
      var sign = app.createMD5('shVerification', nowtime);
      wx.request({
        url: app.globalData.url + '/shDistributor/shVerification',
        // method:"POST",
        data: {
          phone: phone,
          verificationType: 'register',
          timeStamp: nowtime,
          apikey: 'HLBW2018SHAPPLET',
          mac: sign
        },
        success: function(res) {
          // console.log(res)
          if (res.data.code == "0") {
            //倒计时
            that.setData({
              yzmText: that.data.yzmTime + "s后重新发送"
            })
            var timer = setInterval(function() {
              var time = parseInt(that.data.yzmTime) - 1;
              if (time == 0) {
                that.setData({
                  yzmText: "获取验证码",
                  yzmTime: 60
                })
                clearInterval(timer)
                return;
              } else {
                that.setData({
                  yzmText: time + "s后重新发送",
                  yzmTime: time
                })
              }

            }, 1000)
          }
        }
      })
    }
  }
})