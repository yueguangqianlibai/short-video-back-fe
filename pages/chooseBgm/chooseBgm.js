const app = getApp()

Page({
    data: {
      bgmList: [],
      serverUrl: '',
      videoParams: {}
    },
    onLoad: function (params) {
      var me = this;
      console.log(params);
      me.setData({
        videoParams: params
      }); 

      wx.showLoading({
        title: '努力加载ing...'
      })
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + '/bgm/list',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success:function(res){
          console.log(res.data);
          wx.hideLoading();
          if(res.data.status == 0){
            var bgmList = res.data.data;
            me.setData({
              bgmList: bgmList,
              serverUrl: serverUrl
            });
          }
        }
      })
    },

  upload:function(e){
    var me = this;

    var bgmId = e.detail.value.bgmId;
    var desc = e.detail.value.desc;

    var duration = me.data.videoParams.duration;
    var tempheight = me.data.videoParams.tempheight;
    var tempwidth = me.data.videoParams.tempwidth;
    var tempVideoUrl = me.data.videoParams.tempVideoUrl;
    var tempCoverUrl = me.data.videoParams.tempCoverUrl;

    //上传短视频
    wx.showLoading({
      title: '努力上传中...',
    })
    var serverUrl = app.serverUrl;
    wx.uploadFile({
      url: serverUrl + '/video/uploadVideo',
      formData: {
        userId: app.userInfo.id,
        bgmId: bgmId,
        desc: desc,
        videoSeconds: duration,
        videoHeight: tempheight,
        videoWidth: tempwidth
      },
      filePath: tempVideoUrl,
      name: 'file',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = JSON.parse(res.data);
        if (data.status == 0) {
          wx.showToast({
            title: '上传成功~',
            icon: 'success',
            duration: 3000
          });
          wx.navigateBack({
            delea:1,
          })
        }else{
          wx.showToast({
            title: '上传失败了~',
            duration: 3000
          });
        } 
      }
    })
  }
     
})

