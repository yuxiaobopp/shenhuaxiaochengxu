// pages/chooseSeats/chooseSeats.js
var canOnePointMove = false

var onePoint = {

  x: 0,

  y: 0

}

var twoPoint = {

  x1: 0,

  y1: 0,

  x2: 0,

  y2: 0

}
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenCode: null,
    featureAppNo: null,
    seats: null,
    scale: 1,
    translateX: 0,
    translateY: 0,
    location: null,
    date: "",
    // time: "",
    // style: "",
    seatNum: 0,
    seatArr: [],
    price: 0,
    totalPrice: 0,
    seatNumber: [],
    nowlist: null,
    activityPriceNum: 0, //参与特价个数
    activityId: 0,
    orderNum: "",
    isClick: false,
    rowNumMr: -20,
    screenName: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    var that = this;
    that.setData({
      screenCode: options.screenCode,
      featureAppNo: options.featureAppNo,
      location: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaName
    })
    // 单价

    // 头部信息
    var screenPlanList = app.globalData.screenPlanList;
    for (var i = 0; i < screenPlanList.length; i++) {
      var screenPlanList2 = screenPlanList[i].list;
      for (var j = 0; j < screenPlanList2.length; j++) {
        if (screenPlanList[i].list[j].featureAppNo == options.featureAppNo) {
          // console.log("true")
          var price = 0;
          var activityId = null;
          for (var g = 0; g < screenPlanList[i].list[j].qmmComparePrices.length; g++) {
            if (screenPlanList[i].list[j].qmmComparePrices[g].dataType == 0) {
              price = screenPlanList[i].list[j].marketPrice;
              activityId = screenPlanList[i].list[j].activityId
            }
          }
          that.setData({
            date: screenPlanList[i].date,
            nowlist: screenPlanList[i].list[j],
            // time: screenPlanList[i].list[j].startTime2,
            // style: screenPlanList[i].list[j].movieDimensional,
            price: price,
            activityId: activityId
          })
          // console.log(that.data.nowlist)
        }
      }
    }
    that.touchend();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: app.globalData.movieList[app.globalData.movieIndex].movieName //页面标题
    })
    // console.log(app.globalData)
    // console.log("app" + app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode)
    // 获取座位信息
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('seatInfos', nowtime);
    wx.request({
      url: app.globalData.url + '/api/halls/screening/seatInfos',
      data: {
        cinemaCode: app.globalData.cinemaList[app.globalData.cinemaNo].cinemaCode,
        screenCode: that.data.screenCode,
        featureAppNo: that.data.featureAppNo,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        that.setData({
          screenName: res.data.data.screenName
        })
        that.manage(res.data.data.seatsInfo)
      }
    })
  },
  manage: function(res) { //处理数据
    var that = this;
    var maps = [];
    var seats = res;
    var maxRow = 0; // 计算最Y轴
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].YCoord) > maxRow) {
        maxRow = parseInt(seats[i].YCoord)
      }
    }
    var minRow = maxRow; // 计算最小Y轴
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].YCoord) < minRow) {
        minRow = parseInt(seats[i].YCoord)
      }
    }
    // 同行整合
    for (var j = minRow; j < maxRow + 1; j++) {
      maps[j - minRow] = [];
      for (var i = 0; i < seats.length; i++) {
        if (seats[i].YCoord == j) {
          maps[j - minRow].push(seats[i])
        }
      }
    }
    // console.log(maps)
    maxRow = maxRow - minRow + 1;
    var maxColumn = 0; // 计算最大列
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].XCoord) > maxColumn) {
        maxColumn = parseInt(seats[i].XCoord)
      }
    }
    var minColumn = maxColumn; // 计算最小列
    for (var i = 0; i < seats.length; i++) {
      if (parseInt(seats[i].XCoord) < minColumn) {
        minColumn = parseInt(seats[i].XCoord)
      }
    }
    // console.log(minColumn)
    // console.log(maxColumn)
    // 处理列
    var result = [];
    for (var i = 0; i < maps.length; i++) {
      var oneRow = maps[i];
      var newRow = [];
      if (oneRow.length == 0) {
        for (var j = minColumn; j < maxColumn + 1; j++) {
          var row = {};
          row.isEmpty = true;
          newRow.push(row)
        }
      } else {
        for (var j = minColumn; j < maxColumn + 1; j++) {
          var num = 0;
          for (var g = 0; g < oneRow.length; g++) {
            if (maps[i][g].XCoord == j) {
              newRow.push(maps[i][g])
              num++;
            }
          }
          if (num == 0) {
            var row = {};
            row.isEmpty = true;
            newRow.push(row)
          }
        }
      }

      result.push(newRow)
    }
    maps = result;
    // console.log(maps)
    // 情侣座
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        var groupCode = maps[i][j].groupCode;
        for (var g = j + 1; g < maps[i].length; g++) {
          if (groupCode == maps[i][g].groupCode) {
            maps[i][j].isLeft = true;
            maps[i][g].isRight = true;
          }
        }
      }
    }
    // 多人座
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        if (maps[i][j].isLeft && maps[i][j].isRight) {
          maps[i][j].isLeft = false;
          maps[i][j].isRight = false;
          maps[i][j].isMiddle = true;
        }
      }
    }
    //座位名称
    for (var i = 0; i < maps.length; i++) {
      for (var j = 0; j < maps[i].length; j++) {
        maps[i][j].seatname = maps[i][j].rowNum + "排" + maps[i][j].columnNum + "座"
      }
    }
    // console.log(maps)
    var scale = 650 / (maxColumn * 64 - 8);
    that.setData({
      seats: maps,
      scale: scale
    })

  },
  choose: function(e) { //选座
    var that = this;
    var seats = that.data.seats;
    var code = e.currentTarget.dataset.code;
    var seatNum = that.data.seatNum;
    var status = e.currentTarget.dataset.status;
    var checkNum = 0;
    if (canOnePointMove){
      return;
    }
    if (status == "sell") {
      // wx.showModal({
      //   title: '选座失败',
      //   content: '该座位已售出',
      //   showCancel: true
      // })
      return;
    }
    for (var i = 0; i < seats.length; i++) {
      for (var j = 0; j < seats[i].length; j++) {
        if (seats[i][j].groupCode == code) {
          if (seats[i][j].isSelect) {
            seats[i][j].isSelect = false;
            checkNum--;
          } else {
            seats[i][j].isSelect = true;
            checkNum++;
          }

        }
      }
    }
    seatNum = seatNum + checkNum;
    // console.log(that.data.seats)
    if (seatNum > 4) {
      for (var i = 0; i < seats.length; i++) {
        for (var j = 0; j < seats[i].length; j++) {
          if (seats[i][j].groupCode == code) {
            seats[i][j].isSelect = false;
            seatNum--;
          }
        }
      }
      wx.showModal({
        title: '选座失败',
        content: '一次最多购买4张票',
      })
    }
    that.setData({
      seats: seats,
      seatNum: seatNum
    })
    // console.log(that.data.seats)
    that.dealseat();
  },
  dealseat: function() {
    var that = this;
    var seats = that.data.seats;
    var seatArr = [];
    var seatNumber = [];
    for (var i = 0; i < seats.length; i++) {
      for (var j = 0; j < seats[i].length; j++) {
        if (seats[i][j].isSelect) {
          seatArr.push(seats[i][j].seatname)
          seatNumber.push(seats[i][j].seatCode)
        }
      }
    }
    that.setData({
      seatArr: seatArr,
      seatNumber: seatNumber,
    })
    if (that.data.nowlist.marketPrice - that.data.nowlist.disPrice > 0 && that.data.nowlist.globalLeftNum != null) { //有优惠
      var total = 0;
      if (that.data.nowlist.globalLeftNum == -88) { //无限制
        that.setData({
          totalPrice: (seatArr.length * that.data.nowlist.disPrice).toFixed(2),
          activityPriceNum: seatArr.length
        })
      } else {
        if (seatArr.length < that.data.nowlist.globalLeftNum) { //个数内
          that.setData({
            totalPrice: (seatArr.length * that.data.nowlist.disPrice).toFixed(2),
            activityPriceNum: seatArr.length
          })
        } else { //超出个数
          that.setData({
            totalPrice: (that.data.nowlist.globalLeftNum * that.data.nowlist.disPrice + (seatArr.length - that.data.nowlist.globalLeftNum) * that.data.price).toFixed(2),
            activityPriceNum: that.data.nowlist.globalLeftNum
          })
        }
      }

    } else {
      that.setData({
        totalPrice: (seatArr.length * that.data.price).toFixed(2),
        activityPriceNum: 0
      })
    }
  },
  sureSeat: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var sign = app.createMD5('countOrderPrice', nowtime);
    var appData = app.globalData;
    var seatarr = "";
    var seatNumber = "";
    var ticketNum = that.data.seatArr.length;
    var ticketOriginPrice = that.data.price;

    if (that.data.seatArr.length == 0) {
      wx.showModal({
        title: '',
        content: '还没选座位哦',
      })
      return;
    }
    if (!that.data.isClick) {
      that.setData({
        isClick: true
      })
    } else {
      return;
    }
    wx.showLoading()
    for (var i = 0; i < that.data.seatArr.length; i++) {
      seatarr += that.data.seatArr[i] + ","
      seatNumber += that.data.seatNumber[i] + ","
    }
    seatarr = seatarr.substring(0, seatarr.length - 1);
    seatNumber = seatNumber.substring(0, seatNumber.length - 1);
    var activityId = that.data.activityId;
    if (activityId == null) {
      activityId = "";
    }

    wx.request({
      url: app.globalData.url + '/api/shOrder/countOrderPrice',
      data: {
        appUserId: appData.userInfo.id,
        seatId: seatNumber,
        seats: seatarr,
        cinemaNumber: appData.cinemaList[appData.cinemaNo].cinemaCode,
        screenCode: that.data.screenCode,
        featureAppNo: that.data.featureAppNo,
        ticketOriginPrice: ticketOriginPrice,
        ticketNum: ticketNum,
        playName: that.data.nowlist.startTime2 + "-" + that.data.nowlist.endTime2,
        activityId: activityId,
        cineMovieNum: appData.movieList[appData.movieIndex].cineMovieNum,
        activityPriceNum: that.data.activityPriceNum,
        orderNum: that.data.orderNum,
        timeStamp: nowtime,
        mac: sign
      },
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        // console.log(res)
        wx.hideLoading();
        if (res.data.status == 0 && res.data.code == -8) {
          var newlist = that.data.nowlist;
          newlist.globalLeftNum = res.data.data;
          that.setData({
            nowlist: newlist,
            isClick: false
          })
          wx.showToast({
            title: '特惠票卖完了',
            icon: 'loading',
            duration: 2000,
            mask: true,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
          that.dealseat();
          return;
        }
        if (res.data.status == 0 && res.data.code == -7) {
          var newlist = that.data.nowlist;
          newlist.globalLeftNum = 0;
          that.setData({
            nowlist: newlist,
            isClick: false
          })
          wx.showToast({
            title: '特惠活动已结束',
            icon: 'loading',
            duration: 2000,
            mask: true,
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
          that.dealseat();
          return;
        }
        if (res.data.status == 1) {
          app.globalData.seatOrder = res.data.data;
          that.setData({
            orderNum: res.data.data.orderNum
          })
          var date = that.data.date + "  " + that.data.nowlist.startTime2 + "-" + that.data.nowlist.endTime2;
          wx.showToast({
            title: '正在预定座位...',
            icon: 'loading',
            duration: 2000,
            mask: true,
            success: function(res) {
              setTimeout(function() {
                wx.redirectTo({
                  url: '../orderForm/orderForm?date=' + date,
                })
              }, 500)
            },
            fail: function(res) {},
            complete: function(res) {},
          })

        } else {
          wx.showModal({
            title: '选座失败',
            content:'锁座失败，请重新选座',
            showCancel: true
          })
        }
        that.setData({
          isClick: false
        })
      }
    })
  },
  change: function() {
    wx.navigateBack({})
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

  // 缩放，平移
  touchstart: function(e) {

    var that = this

    if (e.touches.length < 2) {

      canOnePointMove = true

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2

    } else {

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

    }

  },
  touchmove: function(e) {

    var that = this

    if (e.touches.length < 2 && canOnePointMove) {

      var onePointDiffX = (e.touches[0].pageX * 2 - onePoint.x) / 2

      var onePointDiffY = (e.touches[0].pageY * 2 - onePoint.y) / 2

      that.setData({

        translateX: onePointDiffX + that.data.translateX,

        translateY: onePointDiffY + that.data.translateY

      })

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2



    } else if (e.touches.length > 1) {

      var preTwoPoint = JSON.parse(JSON.stringify(twoPoint))

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

      // 计算角度，旋转(优先)

      // var perAngle = Math.atan((preTwoPoint.y1 - preTwoPoint.y2) / (preTwoPoint.x1 - preTwoPoint.x2)) * 180 / Math.PI

      // var curAngle = Math.atan((twoPoint.y1 - twoPoint.y2) / (twoPoint.x1 - twoPoint.x2)) * 180 / Math.PI

      // if (Math.abs(perAngle - curAngle) > 1) {

      //   // that.setData({

      //   //   msg: '旋转',

      //   //   rotate: that.data.rotate + (curAngle - perAngle)

      //   // })

      // } else {

      // 计算距离，缩放

      var preDistance = Math.sqrt(Math.pow((preTwoPoint.x1 - preTwoPoint.x2), 2) + Math.pow((preTwoPoint.y1 - preTwoPoint.y2), 2))

      var curDistance = Math.sqrt(Math.pow((twoPoint.x1 - twoPoint.x2), 2) + Math.pow((twoPoint.y1 - twoPoint.y2), 2))
      var scaleNum = that.data.scale + (curDistance - preDistance) * 0.005;
      if (scaleNum < 0.3) {
        scaleNum = 0.3
      }
      that.setData({

        // msg: '缩放',

        scale: scaleNum

      })

      // }

    }
    // that.checkLeft();
  },

  touchend: function(e) {

    var that = this

    canOnePointMove = false

  },
})