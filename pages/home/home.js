// pages/home/home.js
let SCREEN_WIDTH = 750
let RATE = wx.getSystemInfoSync().screenHeight / wx.getSystemInfoSync().screenWidth
Page({
  data: {
    canvasW: SCREEN_WIDTH,
    canvasH: SCREEN_WIDTH * RATE * 0.7,
    cloudId: '',
    imgSrc: '',
    showPlay: true,
    fileList: [],
    dropdownValue: 0,
    active: 0,
    panoramaName: "",
    // right left top bottom front back
    helpSteps: [{
        desc: '上传图片'
      },
      {
        desc: '全景浏览'
      },
      {
        desc: '上传到云'
      },
      {
        desc: '保存并转发Id'
      }
    ],
    steps: [{
        desc: '右',
      },
      {
        desc: '左',
      },
      {
        desc: '上',
      },
      {
        desc: '下',
      },
      {
        desc: '前',
      },
      {
        desc: '后',
      }
    ],
    dropdownOption: [{
        text: '本地文件',
        value: 0
      },
      {
        text: '云端存储',
        value: 1
      },
      {
        text: '图片链接',
        value: 2
      }
    ],
    srcList: []
  },
  onLoad() {
    wx.clearStorageSync()
    wx.cloud.init()
  },
  onDescChange(event) {
    this.setData({
      desc: event.detail
    })
  },
  onImgSrcChange(event) {
    this.setData({
      imgSrc: event.detail
    })
  },
  onCloudIdChange: function (e) {
    this.setData({
      cloudId: e.detail
    })
  },
  onDropdownItemChange: function (e) {
    // console.log(e);
    this.setData({
      dropdownValue: e.detail
    })
  },
  onPlayClick() {
    this.setData({
      showPlay: true
    })
  },
  onHelpClick() {
    console.log('asdas');
    this.setData({
      showPlay: false
    })
  },
  onPanoramaNameChange(e) {
    this.setData({
      panoramaName: e.detail
    })
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    console.log(file);
    // right left top bottom front back 
    let temp = {
      url: file.url,
      // name: this.getImgName(),
    }
    let temp1 = this.data.fileList
    this.setData({
      fileList: [...temp1, temp],
      active: this.data.fileList.length + 1
    })
    // wx.uploadFile({
    //   url: 'xxx', // 仅为示例，非真实的接口地址
    //   filePath: file.url,
    //   name: 'file',
    //   formData: {
    //     user: 'test'
    //   },
    //   success(res) {
    //     // 上传完成需要更新 fileList
    //     const {
    //       fileList = []
    //     } = this.data;
    //     fileList.push({
    //       ...file,
    //       url: res.data
    //     });
    //     this.setData({
    //       fileList
    //     });
    // },
    // }
    // );
  },
  imgDelete(e) {
    // console.log(e.detail);
    let arr = this.data.fileList.filter((item) => item.url != e.detail.file.url)
    // console.log('xxx');
    this.setData({
      fileList: arr,
      active: arr.length
    })
  },
  getImgName() {
    // right left top bottom front back 
    var imgName = ''
    switch (this.data.fileList.length) {
      case 0:
        imgName = 'right'
        break;
      case 1:
        imgName = 'left'
        break;
      case 2:
        imgName = 'top'
        break;
      case 3:
        imgName = 'bottom'
        break;
      case 4:
        imgName = 'front'
        break;
      case 5:
        imgName = 'back'
        break;
    }
    return imgName
  },
  parseImgSrc(src) {
    let tempArr = ['r', 'l', 'u', 'd', 'f', 'b']
    let list = new Array(6).fill('').map((item, i) => src.replace(/([\s\S]*)(\w)\.(jpg|png|jpeg|JPEG|JPG|PNG)$/g, (...arg) =>
      arg[1] + tempArr[i] + '.' + arg[3]
    ))
    return list
  },
  getCloudImgSrc() {
    return new Promise((reslove, reject) => {
      wx.cloud.getTempFileURL({
        fileList: this.parseImgSrc(this.data.cloudId),
        // fileList: [this.data.cloudId],
        success: res => {
          let arr = res.fileList.map(item => item.tempFileURL)
          console.log(arr);
          reslove(arr)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  async fetchCloud() {
    // await this.getCloudImgSrc()
  },
  async onGoBtnClick() {
    if (!this.data.panoramaName) {
      // todo..
    }
    if (this.data.dropdownValue == 1) {
      let p = await this.getCloudImgSrc()
      console.log(p);
      this.setData({
        cloudId: p
      })
    }
    let srcL = []
    switch (this.data.dropdownValue) {
      case 0:
        console.log(this.data.fileList);
        srcL = this.data.fileList.map(item => item.url)
        console.log(srcL);
        break;
      case 1:
        srcL = this.data.cloudId
        break
      case 2:
        srcL = this.data.imgSrc.split(';')
      default:
        break;
    }
    console.log(srcL);
    // this.setData({
    //   srcList: srcL
    // })

    console.log('fuck');
    wx.setStorageSync('panoramaName', this.data.panoramaName)
    wx.navigateTo({
      url: '../../pages/index/index?srcList=' + encodeURIComponent(JSON.stringify(srcL)) + '&type=' + this.data.dropdownValue,
    })
  },
})