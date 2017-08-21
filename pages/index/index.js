var flag = true;
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data:{
    pages: 1,
    distance: 500,
    markers: [],
    circles: [],
    controls:[],
    user: {
      icon: '',
      name: '鸡腿'
    },
    position: {
      latitude: 39.5427,
      longitude: 116.2317
    }
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId);
    this.reloadData();
  },
  reloadData () {
    var getRandomInitPage = function (min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.getMarkers(this.data.position.latitude, this.data.position.longitude, getRandomInitPage(1, this.data.pages))
  },
  getMarkers (lat, lng, index, distance) {
    var that = this;
    qqmapsdk.search({
      keyword: '餐饮',
      location: {
        latitude: lat,
        longitude: lng
      },
      distance: distance || 500,
      page_size: 20,
      page_index: index || 1,
      success: function (res) {
        console.log('success: ', res);
        that.setData({
          circles: [
            {
              latitude: lat,
              longitude: lng,
              radius: 500,
              color: '#87CEEBAA',
              fillColor: '#7cb5ec99'
            }
          ],
          position: {
            latitude: lat,
            longitude: lng,
          },
          pages: Math.floor(res.count / 20),
          markers: res.data.length !== 0
          ? res.data.map((lunch, i) => {
            return {
              iconPath: "./food.svg",
              id: i,
              latitude: lunch.location.lat,
              longitude: lunch.location.lng,
              height: 10
            }
          })
          : []
        })
      },
      fail: function (res) {
        console.log('fail: ', res);
        return that.setData({ markers: [] })
      },
      complete: function (res) {
        console.log('complete: ', res)
      }
    })
  },
  onLoad:function(options){
    qqmapsdk = new QQMapWX({
            key: 'OVLBZ-AQJ64-LDGUH-X4EAG-HJSHS-CDBDL'
        });
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    // for wechat login get user message
    wx.login({
      success: function () {
        wx.getUserInfo({
          success: function (res) {
            console.log('login: ', res)
            that.setData({
              user: {
                icon: res.userInfo.avatarUrl,
                name: res.userInfo.nickName
              }
            })
          }
        })
      },
      fail: function (res) {
        console.log('login_fail: ', res)
      },
      complete: function (res) {
        // wx getlocation
        wx.getLocation({
          type: 'gcj02',
          success: function (res) {
            console.info('location_gcj02: ', res);
            console.info('markers: ', that.getMarkers(res.latitude, res.longitude));
            that.getMarkers(res.latitude, res.longitude)
          },
          fail: function (res) {
            console.error(res);
          },
          complete: function (res) {
            console.log('location_complete: ', res)
          }
        })
      }
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
