var flag = true;
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data:{
    pages: 1,
    index: 1,
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
    },
    last_update:0,
    last_x:0,
    last_y:0,
    last_z:0,
    polyline: []
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
  shakeRes () {
    this.pickLunch(true);
    return false;
  },
  shakeRock () {
    var determination = false;
    var that = this;
    function shake(){
      wx.startAccelerometerChange(function(res) {
        var curTime = new Date().getTime()
        var SHAKE_THRESHOLD = 60
        var last_update = that.data.last_update
        console.log(curTime - last_update);
        if ((curTime - last_update) > 100) {
          var diffTime = curTime - last_update;
          var speed = Math.abs(res.x + res.y + res.z - that.data.last_x - that.data.last_y - that.data.last_z) / diffTime * 10000;
          if (speed > SHAKE_THRESHOLD && !determination) {
            wx.showLoading({ title: 'shake...' })
            determination = true;
            determination = that.shakeRes();
          }
          that.setData({
            last_update: curTime,
            last_x: res.x,
            last_y: res.y,
            last_z: res.z
          })
        }
      })
    };
    shake();
  },
  pickLunch (bool) { // 随机挑选吃饭的地方
    var lunch = this.data.markers[Math.round(Math.random() * (this.data.markers.length - 1))];
    var that = this;
    wx.showLoading({ title: '大声说出你要吃什么...' })
    setTimeout(function () {
      wx.hideLoading();
      if (bool) {
        wx.stopAccelerometer();
      };
      wx.showModal({
        title: lunch.title,
        content: lunch.address,
        cancelText: '再来一次',
        confirmText: '就吃这个',
        success: function (res) {
          if (res.confirm) {
            console.log('确定')
            // qqmapsdk.calculateDistance({
            //   mode: 'walking',
            //   to: `${lunch.latitude},${lunch.longitude}`,
            //   success: function (res) {},
            //   fail: function (res) {},
            //   complete: function (res) {
            //     console.log('polyline', res)
            //   }
            // })
            console.log(lunch);
            that.setData({
              polyline: [{
                points: [{
                  longitude: that.data.position.longitude,
                  latitude: that.data.position.latitude
                }, {
                  longitude: lunch.longitude,
                  latitude: lunch.latitude
                }],
                color:"#FF0000DD",
                width: 2,
                dottedLine: true
              }]
            })
          } else {
            console.log('取消')
          }
        }
      })
    }, 2000)
  },
  reloadData () {
    var getRandomInitPage = function (min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.getMarkers(this.data.position.latitude, this.data.position.longitude, getRandomInitPage(1, this.data.pages), this.data.distance)
  },
  distanceChange (e) {
    console.info(e)
    e.detail.value
      ? this.getMarkers(this.data.position.latitude, this.data.position.longitude, this.data.index, 1000)
    : this.getMarkers(this.data.position.latitude, this.data.position.longitude, this.data.index, 500)
  },
  getMarkers (lat, lng, index, distance) {
    var that = this;
    wx.showLoading({ title: '加载中...', mask: true })
    qqmapsdk.search({
      keyword: '快餐',
      location: {
        latitude: lat,
        longitude: lng
      },
      distance: distance || 500,
      page_size: 20,
      page_index: index || 1,
      success: function (res) {
        that.data.circles = [{
          latitude: lat,
          longitude: lng,
          radius: distance || 500,
          color: '#87CEEBAA',
          fillColor: '#7cb5ec99'
        }];
        that.data.position = {
          latitude: lat,
          longitude: lng
        };
        that.data.index = index;
        that.data.pages = Math.floor(res.count / 20);
        that.data.distance = distance;

        if (res.data.length !== 0) {
          that.data.markers = res.data.map((lunch, i) => {
            return {
              iconPath: "/pages/index/food.png",
              id: i,
              latitude: lunch.location.lat,
              longitude: lunch.location.lng,
              height: 20,
              width: 20,
              address: lunch.address,
              title: lunch.title,
              callout: {
                content: lunch.title,
                color: '#000',
                borderRadius: 4,
                bgColor: '#fff',
                padding: 2,
                display: 'ALWAYS'
              }
            }
          });
        } else {
          that.dasta.markers = []
          wx.showToast({
            title: '这是火星么?尽然没有吃的...',
            icon: 'success',
            duration: 2000
          })
        }
        that.setData(that.data)
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '要饿死的节奏...',
          icon: 'error',
          duration: 2000
        })
        return that.setData({ markers: [] })
      },
      complete: function (res) {
        wx.hideLoading()
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
            // console.info('location_gcj02: ', res);
            that.getMarkers(res.latitude, res.longitude)
          },
          fail: function (res) {
            console.error(res);
          },
          complete: function (res) {
            // console.log('location_complete: ', res)
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
