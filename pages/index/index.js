const app = getApp()

Page({
  data: {
    totalPage : 1,
    pageNum : 1,
    videoList: [],

    screenWidth:350,
    serverUrl: ""
  },

  onLoad: function () {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });

    //获取当前的分页数
    var page = me.data.pageNum;
    me.getAllVideoList(page);
  },
  getAllVideoList:function(page){
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '努力加载中...',
    })

    wx.request({
      url: serverUrl + "/video/showAllVideo",
      method: "POST",
      data: {
        pageNum: page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        console.log(res.data);
        if (page == 1) {
          me.setData({
            videoList: []
          });
        }

        var videoList = res.data.data.rows;
        var newVideoList = me.data.videoList;

        me.setData({
          videoList: newVideoList.concat(videoList),
          pageNum: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        });
      }
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1);
  },
  onReachBottom:function(){
    var me = this;
    var currentPage = me.data.pageNum;
    var totalPage = me.data.totalPage;
    //判断当前页数和总页数是否相等，如果相等就没有比要查询
    if(currentPage === totalPage){
      wx.showToast({
        title: '已经没有视频了~',
        icon: "none"
      })
      return;
    }
    var page = currentPage + 1;
    me.getAllVideoList(page);
  }

})
