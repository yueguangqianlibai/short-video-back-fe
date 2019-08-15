const app = getApp()

Page({
  data: {
    reasonType: "请选择原因",
    reportReasonArray: app.reportReasonArray,
    publishUserId: "",
    videoId: ""
  },
  onLoad: function(params) {
    var me = this;

    var videoId = params.videoId;
    var publishUserId = params.publishUserId;

    me.setData({
      publishUserId: publishUserId,
      videoId: videoId,
    });
  },
  changeMe: function(e) {
    var me = this;

    var index = e.detail.value;
    var reasonType = app.reportReasonArray[index];

    me.setData({
      reasonType: reasonType
    })
  },
  submitReport: function(e) {
    var me = this;

    var reasonIndex = e.detail.value.reasonIndex;
    var reasonContent = e.detail.value.reasonContent;

    var user = app.getGlobalUserInfo();

    var currentUserId = user.id;

    if (reasonIndex == null || reasonIndex == '' || reasonIndex == undefined) {
      wx.showToast({
        title: '请选择举报理由',
        icon: 'none'
      })
      return;
    }

    var serverUrl = app.serverUrl;

    wx.request({
      url: serverUrl + '/userService/reportUser',
      method: 'POST',
      data: {
        dealUserId: me.data.publishUserId,
        dealVideoId: me.data.videoId,
        title: app.reportReasonArray[reasonIndex],
        content: reasonContent,
        userId: currentUserId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.showToast({
          title: res.data.msg,
          duration: 3000,
          icon: 'success',
          success: function() {
            wx.navigateBack();
          }
        })
      }
    })
  }

})