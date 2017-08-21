var flag = true;
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data:{
    markers: [{
      iconPath: "/resources/others.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 50,
      height: 50
    }],
    polyline: [{
      points: [{
        longitude: 113.3245211,
        latitude: 23.10229
      }, {
        longitude: 113.324520,
        latitude: 23.21229
      }],
      color:"#FF0000DD",
      width: 2,
      dottedLine: true
    }],
    controls: [{
      id: 1,
      iconPath: '/resources/location.png',
      position: {
        left: 0,
        top: 300 - 50,
        width: 50,
        height: 50
      },
      clickable: true
    }]
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId)
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    // for wechat login get user message
    var that = this;
    wx.login({
      success: function () {
        wx.getUserInfo({
          success: function (res) {
            console.log('login: ', res)
          }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })

    qqmapsdk = new QQMapWX({
            key: 'OVLBZ-AQJ64-LDGUH-X4EAG-HJSHS-CDBDL'
        });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    qqmapsdk.search({
      keyword: '餐饮',
      success: function (res) {
        console.log('success: ', res);
      },
      fail: function (res) {
        console.log('fail: ', res);
      },
      complete: function (res) {
        console.log('complete: ', res)
      }
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
