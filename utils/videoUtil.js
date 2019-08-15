// var videoUtil = require('../../utils/videoUtil.js')

function uploadVideo() {
  var me = this;
  wx.chooseVideo({
    sourceType: ['album', 'camera'],
    success: function(res) {
      console.log(res);
      var duration = res.duration;
      var tempheight = res.height;
      var tempwidth = res.width;
      var tempVideoUrl = res.tempFilePath;
      var tempCoverUrl = res.thumbTempFilePath;

      if (duration > 11) {
        wx.showToast({
          title: '视频长度不可超过10秒~~',
          icon: 'none',
          duration: 3000
        })
      } else if (duration < 3) {
        wx.showToast({
          title: '视频长度不可小于3秒~~',
          icon: 'none',
          duration: 3000
        })
      } else {
        wx.navigateTo({
          url: '../chooseBgm/chooseBgm?duration=' + duration +
            "&tempheight=" + tempheight +
            "&tempwidth=" + tempwidth +
            "&tempVideoUrl=" + tempVideoUrl +
            "&tempCoverUrl=" + tempCoverUrl
        })
      }
    }
  })

}

module.exports = {
  uploadVideo: uploadVideo
}