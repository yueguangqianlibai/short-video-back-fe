// 全局对象
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },
  doRegist:function(e){
    var formObject = e.detail.value;
    var username = formObject.username;
    var password = formObject.password;

    if (username.length == 0 || password.length == 0){
      wx.showToast({
        title: '用户名或密码为空',
        icon: "none",
        duration: 2000
      })
    } else if (/.*[\u4e00-\u9fa5]+.*$/.test(username)){
      wx.showToast({
        title: '用户名不可为中文',
        icon: "none",
        duration: 2000
      })
    }else{
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '努力加载ing...',
      })
      wx.request({
        url: serverUrl +'/users/regist',
        method: "POST",
        data: {
          username:username,
          password:password
        },
        header:{
          'content-type': 'application/x-www-form-urlencoded'
        },
        success:function(res){
          wx.hideLoading();
          console.log(res.data);
          var status = res.data.status;
          if(status == 0){
            wx.showToast({
              title: res.data.msg,
              icon: "success",
              duration: 2000
              }),
              app.userInfo = res.data.data;
          }else if(status == 1){
            wx.showToast({
              title: res.data.msg,
              icon:"none",
              duration:2000
            })
          }
        }
      })
    }
  },
  goLoginPage:function(){
    wx.navigateTo({
      url: '../userLogin/login',
    })
  }
})