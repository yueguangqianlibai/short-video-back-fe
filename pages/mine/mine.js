// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    isMe: true,
    faceUrl: "../resource/images/noneface.png",
  },
  
  onLoad: function () {
    var me = this;
    var user = app.userInfo;
    wx.showLoading({
      title: '努力加载ing...',
    })
    wx.request({
      url: app.serverUrl + '/userService/queryInfo',
      method: 'POST',
      data: {
        userId: user.id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if(res.data.status == 0){
          var userInfo =  res.data.data
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != "" && userInfo.faceImage != undefined){
            faceUrl = app.serverUrl + userInfo.faceImage;
          }   
          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname
          });
        }
      }
    })

  },
  logout: function (){
    var user = app.userInfo;
    var serverUrl = app.serverUrl;
    console.log(user.id);
    wx.showLoading({
      title: '努力加载ing...',
    })
    wx.request({
      url: serverUrl + '/users/logout',
      method: "POST",
      data: {
        userId: user.id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        var status = res.data.status;
        if (status == 0) {
          //注销成功
          wx.showToast({
            title: res.data.msg,
            icon: "success",
            duration: 3000
          }),
            //跳转界面
          app.userInfo = null;
          wx.navigateTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  changeFace: function(){
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        
        wx.showLoading({
          title: '努力上传中...',
        })
        var serverUrl = app.serverUrl;
        wx.uploadFile({
          url: serverUrl +'/userService/uploadFace',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            userId: app.userInfo.id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success: function(res){
            var data = JSON.parse(res.data);
            console.log(data);
            wx.hideLoading();
            if(data.status == 0){
              wx.showToast({
                title: '上传成功~',
                icon: 'success',
                duration: 3000
              })

              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              });
            } else if (data.status == 1){
              wx.showToast({
                title: data.msg,
                icon: 'loading',
                duration: 3000
              })
            }
          }
        })
      }
    })
  }, 
  uploadVideo: function(){
    var me = this;
    wx.chooseVideo({
      sourceType: ['album','camera'],
      success: function(res){
        console.log(res);
        var duration = res.duration;
        var tempheight = res.height;
        var tempwidth = res.width;
        var tempVideoUrl = res.tempFilePath;
        var tempCoverUrl = res.thumbTempFilePath;

        if (duration > 11){
          wx.showToast({
            title: '视频长度不可超过10秒~~',
            icon: 'none',
            duration:3000   
          })
        }else if(duration < 3){
          wx.showToast({
            title: '视频长度不可小于3秒~~',
            icon: 'none',
            duration: 3000
          })
        }else{
          wx.navigateTo({
            url: '../chooseBgm/chooseBgm?duration=' + duration
              + "&tempheight=" + tempheight
              + "&tempwidth=" + tempwidth
              + "&tempVideoUrl=" + tempVideoUrl
              + "&tempCoverUrl=" + tempCoverUrl
          })
        }   
      }
    })

  }
})
