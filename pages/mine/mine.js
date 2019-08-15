var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    isMe: true,
    faceUrl: "../resource/images/noneface.png",
    isFollow: false,


    videoSelClass: "video-info",

    isSelectedWork: "video-info-selected",
    isSelectedLike: "",
    isSelectedFollow: "",

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    likeVideoList: [],
    likeVideoPage: 1,
    likeVideoTotal: 1,

    followVideoList: [],
    followVideoPage: 1,
    followVideoTotal: 1,

    myWorkFalg: false,
    myLikesFalg: true,
    myFollowFalg: true
  },

  onLoad: function(params) {
    var me = this;

    var user = app.getGlobalUserInfo();
    var userId = user.id;

    var publisherId = params.publisherId;
    if (publisherId != null && publisherId != '' && publisherId != undefined) {
      if (userId != publisherId) {
        userId = publisherId;
        me.setData({
          isMe: false,
          publisherId: publisherId,
        });
      } else {
        userId = publisherId;
        me.setData({
          isMe: true,
          publisherId: publisherId,
        });
      }
    }


    var me = this;
    // var user = app.userInfo;

    wx.showLoading({
      title: '努力加载ing...',
    })

    wx.request({
      url: app.serverUrl + '/userService/queryInfo',
      method: 'POST',
      data: {
        userId: userId,
        fanId: user.id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          var userInfo = res.data.data
          var faceUrl = "../resource/images/noneface.png";
          if (userInfo.faceImage != null && userInfo.faceImage != "" && userInfo.faceImage != undefined) {
            faceUrl = app.serverUrl + userInfo.faceImage;
          }
          // debugger;
          me.setData({
            faceUrl: faceUrl,
            fansCounts: userInfo.fansCounts,
            followCounts: userInfo.followCounts,
            receiveLikeCounts: userInfo.receiveLikeCounts,
            nickname: userInfo.nickname,
            isFollow: userInfo.follow,
            userId: userInfo.id
          });
          me.doSelectWork();
        } else if (res.data.status == 30) {
          wx.showToast({
            title: res.data.msg,
            duration: 3000,
            icon: "none",
            success: function() {
              wx.redirectTo({
                url: "../userLogin/login",
              })
            }
          })
        }
      }
    });

  },

  followMe: function(e) {
    var me = this;
    var publisherId = me.data.publisherId;
    var user = app.getGlobalUserInfo();
    var userId = user.id;

    var followType = e.currentTarget.dataset.followtype;

    var url = "";
    //1-关注 ，0-取消关注
    if (followType == "1") {
      url = "/userService/beYourFans?userId=" + publisherId + "&fanId=" + userId;
    } else {
      url = "/userService/notBeYourFans?userId=" + publisherId + "&fanId=" + userId;
    }
    wx.showLoading();
    wx.request({
      url: app.serverUrl + url,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function() {
        wx.hideLoading();
        if (followType == "1") {
          me.setData({
            isFollow: true,
            fansCounts: ++me.data.fansCounts
          })
        } else {
          me.setData({
            isFollow: false,
            fansCounts: --me.data.fansCounts
          })
        }
      }
    })
  },
  logout: function() {
    var user = app.getGlobalUserInfo();
    var serverUrl = app.serverUrl;
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
      success: function(res) {
        wx.hideLoading();
        var status = res.data.status;
        if (status == 0) {
          //注销成功
          wx.showToast({
              title: res.data.msg,
              icon: "success",
              duration: 3000
            }),
            //跳转界面
            // app.userInfo = null;
            //注销以后清空缓存
            wx.removeStorageSync("userInfo");
          wx.navigateTo({
            url: '../userLogin/login',
          })
        }
      }
    })
  },

  changeFace: function() {
    var me = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;

        wx.showLoading({
          title: '努力上传中...',
        })
        var serverUrl = app.serverUrl;
        var userInfo = app.getGlobalUserInfo();
        wx.uploadFile({
          url: serverUrl + '/userService/uploadFace',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            userId: userInfo.id
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'userId': userInfo.id,
            'userToken': userInfo.userToken
          },
          success: function(res) {
            var data = JSON.parse(res.data);
            wx.hideLoading();
            if (data.status == 0) {
              wx.showToast({
                title: '上传成功~',
                icon: 'success',
                duration: 3000
              })

              var imageUrl = data.data;
              me.setData({
                faceUrl: serverUrl + imageUrl
              });
            } else if (data.status == 1) {
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
  uploadVideo: function() {
    videoUtil.uploadVideo();
  },
  doSelectWork: function() {
    this.setData({
      isSelectedWork: "video-info-selected",
      isSelectedLike: "",
      isSelectedFollow: "",

      myWorkFalg: false,
      myLikesFalg: true,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyVideoList(1);
  },
  doSelectLike: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "video-info-selected",
      isSelectedFollow: "",

      myWorkFalg: true,
      myLikesFalg: false,
      myFollowFalg: true,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyLikesList(1);
  },
  doSelectFollow: function() {
    this.setData({
      isSelectedWork: "",
      isSelectedLike: "",
      isSelectedFollow: "video-info-selected",

      myWorkFalg: true,
      myLikesFalg: true,
      myFollowFalg: false,

      myVideoList: [],
      myVideoPage: 1,
      myVideoTotal: 1,

      likeVideoList: [],
      likeVideoPage: 1,
      likeVideoTotal: 1,

      followVideoList: [],
      followVideoPage: 1,
      followVideoTotal: 1
    });
    this.getMyFollowList(1);
  },
  getMyVideoList: function(page) {
    var me = this;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    var userId = me.data.userId;
    wx.request({
      url: serverUrl + '/video/showUserWorks?userId=' + userId + '&pageNum=' + page + '&pageSize=' + 9,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var myVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.myVideoList;
        me.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },
  getMyLikesList: function(page) {
    var me = this;
    var userId = me.data.userId;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/video/getUserLikesList?userId=' + userId + '&pageNum=' + page + '&pageSize=' + 9,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var likeVideoList = res.data.data.rows;
        wx.hideLoading();
        var newVideoList = me.data.likeVideoList;
        me.setData({
          likeVideoPage: page,
          likeVideoList: newVideoList.concat(likeVideoList),
          likeVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },
  getMyFollowList: function(page) {
    var me = this;
    var userId = me.data.userId;
    wx.showLoading();
    var serverUrl = app.serverUrl;
    wx.request({
      url: serverUrl + '/users/getMyFollowList?userId=' + userId + '&pageNum=' + page + '&pageSize=' + 9,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var followVideoList = res.data.data.rows;
        wx.hideLoading();

        var newVideoList = me.data.followVideoList;
        me.setData({
          followVideoPage: page,
          followVideoList: newVideoList.concat(followVideoList),
          followVideoTotal: res.data.data.total,
          serverUrl: app.serverUrl
        });
      }
    })
  },
  showVideo: function(e) {

    var me = this;
    var myWorkFalg = me.data.myWorkFalg;
    var myLikesFalg = me.data.myLikesFalg;

    if (!myWorkFalg) {
      var videoList = me.data.myVideoList;
    } else if (!myLikesFalg) {
      var videoList = this.data.likeVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/video?videoInfo=' + videoInfo,
    })
  },
  showFollowManInfo: function(e) {

    var me = this;
    var myFollowFalg = me.data.myFollowFalg;

    if (!myFollowFalg) {
      var videoList = this.data.followVideoList;
    }

    var arrindex = e.target.dataset.arrindex;
    var followManId = videoList[arrindex].id;

    var url = '../mine/mine?publisherId=' + followManId;

    wx.navigateTo({
      url: url,
    })

  },
  onReachBottom: function() {
    var myWorkFalg = this.data.myWorkFalg;
    var myLikesFalg = this.data.myLikesFalg;
    var myFollowFalg = this.data.myFollowFalg;

    if (!myWorkFalg) {
      //当前页数
      var currentPage = this.data.myVideoPage;
      //总页数
      var totalPage = this.data.myVideoTotal;
      //如果当前页等于总页数
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyVideoList(page);
    } else if (!myLikesFalg) {
      var currentPage = this.data.likeVideoPage;
      var totalPage = this.data.likeVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有视频啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyLikesList(page);
    }else if(!myFollowFalg){
      var currentPage = this.data.followVideoPage;
      var totalPage = this.data.followVideoTotal;
      // 获取总页数进行判断，如果当前页数和总页数相等，则不分页
      if (currentPage === totalPage) {
        wx.showToast({
          title: '已经没有其他关注的用户啦...',
          icon: "none"
        });
        return;
      }
      var page = currentPage + 1;
      this.getMyFollowList(page);
    }
  }
})