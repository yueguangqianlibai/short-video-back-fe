const app = getApp()
var videoUtil = require('../../utils/videoUtil.js')

Page({
  data: {
    cover: "",
    videoId: "",
    src: "",
    videoInfo: {},
    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

    placeholder: '说点什么...'
  },
  videoCtx: {},
  onLoad: function(params) {
    var me = this;
    me.videoCtx = wx.createVideoContext("myVideo", me);
    //获取上一个页面传递的参数
    var videoInfo = JSON.parse(params.videoInfo);
    var height = videoInfo.videoHeigh;
    var width = videoInfo.videoWidth;
    var cover = "cover";
    if (width >= height) {
      cover = "";
    }


    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      cover: cover
    });

    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = "";
    if (user != null && user != "" && user != undefined) {
      loginUserId = user.id;
    } else {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }
    wx.request({
      url: serverUrl + '/userService/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publisherUserId=" + videoInfo.userId,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'userId': user.id,
        'userToken': user.userToken
      },
      success: function(res) {
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;
        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        });
      }
    })
    me.getCommmentsList(1);
  },
  onShow: function() {
    var me = this;
    me.videoCtx.play();
  },
  onHide: function() {
    var me = this;
    me.videoCtx.pause();
  },
  showSearch: function() {
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  showPublisher: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoInfo = me.data.videoInfo;
    var realUrl = "../mine/mine#publisherId@" + videoInfo.userId;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }


  },
  upload: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoList = JSON.stringify(me.data.videoInfo);
    var realUrl = "../videoinfo/video#videoInfo@" + videoList;

    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
  },
  showIndex: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  showMine: function() {
    var me = this;
    var user = app.getGlobalUserInfo();
    var videoList = JSON.stringify(me.data.videoInfo);
    var realUrl = "../videoinfo/video#videoInfo@" + videoList;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  likeVideoOrNot: function() {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();
    var videoList = JSON.stringify(me.data.videoInfo);
    var realUrl = "../videoinfo/video#videoInfo@" + videoList;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      var userLikeVideo = me.data.userLikeVideo;
      console.log("videoCreatorId=" + videoInfo.userId);
      var url = "/video/userLike?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreatorId=" + videoInfo.userId;
      if (userLikeVideo) {
        url = "/video/userUnlike?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreatorId=" + videoInfo.userId;
      }
      var serverUrl = app.serverUrl;
      wx.showLoading({
        title: '....'
      })
      console.log(url);
      wx.request({
        url: serverUrl + url,
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'userId': user.id,
          'userToken': user.userToken
        },
        success: function(res) {
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          });
        }
      })
    }
  },
  shareMe: function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    wx.showActionSheet({
      itemList: ['下载到本地', '举报用户', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
      success: function(res) {
        if (res.tapIndex == 0) {
          //下载到本地
          wx.showLoading({
            title: '下载中...',
          })
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath,
            success: function(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: function(res) {
                    console.log(res.errMsg)
                    wx.hideLoading();
                  }
                })
              }
              wx.hideLoading();
            }
          })
        } else if (res.tapIndex == 1) {
          //举报用户
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoInfo/video#videoInfo@' + videoInfo;
          if (user == null || user == "" || user == undefined) {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            //视频发布者id
            var publishUserId = me.data.videoInfo.userId;

            //视频id
            var videoId = me.data.videoInfo.id;
            //当前用户id
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + '&publishUserId=' + publishUserId + '&currentUserId=' + currentUserId,
            })
          }
        } else {
          wx.showToast({
            title: '暂未开放',
            icon: 'none'
          })
        }

      }
    })
  },
  onShareAppMessage: function(res) {
    var me = this;
    var videoInfo = me.data.videoInfo;

    return {
      title: '短视频内容分享',
      path: "pages/videoinfo/video?videoInfo=" + JSON.stringify(videoInfo)
    }
  },
  leaveComment: function() {
    this.setData({
      commentFocus: true
    });
  },
  replyFocus: function(e) {
    var me = this;
    console.log(e.currentTarget.dataset);
    var fatherCommentId = e.currentTarget.dataset.fathercommentid;
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname;

    me.setData({
      placeholder: '回复 ' + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    });
  },
  saveComment: function(e) {
    var me = this;
    var content = e.detail.value;

    //获取回复评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid;
    var toUserId = e.currentTarget.dataset.replytouserid;


    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoInfo/video#videoInfo@' + videoInfo;
    if (user == null || user == "" || user == undefined) {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + '&toUserId=' + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'userId': user.id,
          'userToken': user.userToken
        },
        data: {
          fromUserId: user.id,
          videoId: me.data.videoInfo.id,
          comment: content
        },
        success: function(res) {
          console.log(res.data);
          wx.hideLoading();

          me.setData({
            contentValue: '',
            commentsList: []
          });

          me.getCommmentsList(1);
        }
      })
    }
  },
  getCommmentsList: function(page) {
    var me = this;
    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + '&pageNum=' + page + '&pageSize=5',
      method: 'POST',
      success: function(res) {
        var commentsList = res.data.data.rows;
        console.log(commentsList);
        var newCommentsList = me.data.commentsList;

        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage) {
      return;
    }
    var pageNum = currentPage + 1;
    me.getCommmentsList(pageNum);
  }
})