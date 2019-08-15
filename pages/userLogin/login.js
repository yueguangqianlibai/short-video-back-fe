const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },
  onLoad: function(params) {
    var me = this;
    var redirectUrl = params.redirectUrl;
    if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
      redirectUrl = redirectUrl.replace(/#/g, "?");
      redirectUrl = redirectUrl.replace(/@/g, "=");

      me.redirectUrl = redirectUrl;
    }
  },
  doLogin: function(e) {
    var me = this;
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码为空',
        icon: "none",
        duration: 2000
      })
    } else if (/.*[\u4e00-\u9fa5]+.*$/.test(username)) {
      wx.showToast({
        title: '用户名不可为中文',
        icon: "none",
        duration: 2000
      })
    } else {
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '努力加载ing...',
      })
      wx.request({
        url: serverUrl + '/users/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          wx.hideLoading();
          console.log(res.data);
          var status = res.data.status;
          if (status == 0) {
            //登录成功
            wx.showToast({
                title: res.data.msg,
                icon: "success",
                duration: 2000
              }),
              //app.userInfo = res.data.data;
              //fix me 修改原有的的全局对象为本地缓存
              app.setGlobalUserInfo(res.data.data);
            var redirectUrl = me.redirectUrl;
            if (redirectUrl != null && redirectUrl != "" && redirectUrl != undefined) {
              wx.navigateTo({
                url: redirectUrl,
              })
            } else {
              //跳转界面
              wx.navigateTo({
                url: '../mine/mine',
              })
            }
          } else if (status == 1) {
            wx.showToast({
              title: res.data.msg,
              icon: "none",
              duration: 2000
            })
          }
        }
      })
    }
  },
  goRegistPage: function() {
    wx.navigateTo({
      url: '../userRegist/regist',
    })
  }
})