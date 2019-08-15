const app = getApp()

Page({
  data: {
    totalPage: 1,
    pageNum: 1,
    videoList: [],

    screenWidth: 350,
    serverUrl: "",
    searchContent: ""
  },

  onLoad: function(params) {
    var me = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    me.setData({
      screenWidth: screenWidth,
    });
    if (params.search == undefined) {
      params.search = '';
    }
    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }

    me.setData({
      searchContent: searchContent
    });

    //获取当前的分页数
    var page = me.data.pageNum;
    me.getAllVideoList(page, isSaveRecord);
  },
  getAllVideoList: function(page, isSaveRecord) {
    var me = this;
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '努力加载中...',
    })
    if (searchContent == null || searchContent == '' || searchContent == 'undefined') {
      searchContent: '';
    }

    var searchContent = me.data.searchContent;
    wx.request({
      url: serverUrl + "/video/showAllVideo",
      method: "POST",
      data: {
        pageNum: page,
        isSaveRecord: isSaveRecord,
        videoDesc: searchContent
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
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
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.getAllVideoList(1, 0);
  },
  onReachBottom: function() {
    var me = this;
    var currentPage = me.data.pageNum;
    var totalPage = me.data.totalPage;
    //判断当前页数和总页数是否相等，如果是查询
    if (currentPage === totalPage) {
      wx.showToast({
        title: '已经没有视频了~',
        icon: "none"
      })
      return;
    }
    var page = currentPage + 1;
    me.getAllVideoList(page, 0);
  },
  showVideoInfo: function(e) {
    var me = this;
    var videoList = me.data.videoList;
    var errindex = e.target.dataset.arrindex;
    var videoInfo = JSON.stringify(videoList[errindex]);
    wx.navigateTo({
      url: '../videoinfo/video?videoInfo=' + videoInfo,
    })
  }

})