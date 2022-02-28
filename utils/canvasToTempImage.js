const canvasToTempImage = function (id) {
  wx.canvasToTempFilePath({
    canvasId: id,
    success: (res) => {
      let tempFilePath = res.tempFilePath;
      this.setData({
        imgSrc: tempFilePath,
      });
    }
  }, this);
}
// const canvasToTempImage: function () {
//     var that = this
//     setTimeout(() => {
//       wx.canvasToTempFilePath({
//         canvasId: "canvasIndex",
//         x: 0,
//         y: 0,
//         width: that.data.ScreenTotalW,
//         height: that.data.ScreenTotalH,
//         success: (res) => {
//           let tempFilePath = res.tempFilePath;
//           console.log('go', tempFilePath);
//           that.setData({
//             imgSrc: tempFilePath,
//           });
//         },
//         fail: (err) => {
//           console.log(err)
//         }
//       }, this);
//     }, 300)

module.exports = {
  canvasToTempImage
}