// pages/label/label.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    radio: 'src',
    position: null,
    title: '',
    desc: '',
    src: '',
    errorTitleMsg: '',
    errorDescMsg: '',
    thumb: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    const position = JSON.parse(decodeURIComponent(options.position))
    console.log(position);
    this.setData({
      position: position
    })
    this.changeNavigationBatTitleText()
  },
  onClickLeft() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  onTitleChange(event) {
    this.setData({
      title: event.detail
    })
  },
  onDescChange(event) {
    this.setData({
      desc: event.detail
    })
  },
  onSrcChange(event) {
    this.setData({
      src: event.detail
    })
  },

  changeNavigationBatTitleText: function () {},
  onClickLeft: function () {
    wx.navigateBack({
      delta: 0,
    })
  },
  onRadioChange: function (e) {
    this.setData({
      radio: e.detail
    })
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    console.log(file);
    this.setData({
      fileList: [{
        url: file.url,
        deletable: true
      }],
      thumb: file.url
    })
    wx.uploadFile({
      url: 'xxx', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: {
        user: 'test'
      },
      success(res) {
        // 上传完成需要更新 fileList
        const {
          fileList = []
        } = this.data;
        fileList.push({
          ...file,
          url: res.data
        });
        this.setData({
          fileList
        });
      },
    });
  },
  onCancelClcik() {
    wx.navigateBack({
      delta: 0,
    })
  },
  onConfirmClick() {
    if (this.data.title.length == 0 || this.data.desc.length == 0) {
      console.log('errorInput');
      if (this.data.title.length == 0) {
        this.setData({
          errorTitleMsg: '尚未输入标签名'
        })
      }
      if (this.data.desc.length == 0) {
        this.setData({
          errorDescMsg: '尚未输入标签描述信息'
        })
      }
    } else {
      console.log('sadasdasdas');
      try {
        let flag = wx.getStorageSync('labelArray')
        wx.setStorageSync('labelArray', flag ? flag + ',' + this.data.title : this.data.title)
        wx.setStorageSync('addFlag', true)
        wx.setStorageSync(this.data.title, {
          title: this.data.title,
          desc: this.data.desc,
          thumb: this.data.thumb,
          position: this.data.position
        })
      } catch (e) {
        console.log(e);
      }
      wx.navigateBack({
        delta: 0,
      })
    }

  },
})