// var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    isMe: true,
    faceUrl: "../resource/images/noneface.png",
  },

  onLoad: function (params) {

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
  }
})
