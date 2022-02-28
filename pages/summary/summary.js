// pages/summary/summary.js.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    labelArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let labelArr = wx.getStorageSync('labelArray').split(',')
    console.log(labelArr);
    let temp = []
    labelArr.forEach((item, i) => {
      temp[i] = wx.getStorageSync(item)
      temp[i].position.x = temp[i].position.x.toFixed(2)
      temp[i].position.y = temp[i].position.y.toFixed(2)
      temp[i].position.z = temp[i].position.z.toFixed(2)
      // temp[i].thumb = temp[i].thumb || '../../assets/slot.png'
    })
    console.log(temp);
    this.setData({
      labelArray: temp
    })
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1
    })
  },
  onCopyBtnClcik(e) {
    wx.setClipboardData({
      data: this.getIndexesLabel(e.target.dataset.indexes),
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },
  getIndexesLabel(index) {
    let item = this.data.labelArray.filter(item => item.title == index)
    return JSON.stringify(item)
  }

})