import * as THREE from '../../libs/three.weapp.min.js'
import Notify from '@vant/weapp/notify/notify';
import Dialog from '@vant/weapp/dialog/dialog';
import {
  OrbitControls
} from '../../libs/OrbitControl2.js'
import {
  checkOffset
} from '../../utils/checkOffset.js';
const SCREEN_WIDTH = 750
const RATE = wx.getSystemInfoSync().screenHeight / wx.getSystemInfoSync().screenWidth
const pixelRatio = wx.getSystemInfoSync().pixelRatio
Page({
  panorama: {
    mesh: null,
    camera: null,
    controls: null,
    scene: null,
    renderer: null,
    activePoint: {
      x: 533,
      y: -183.8236300084131,
      z: 486.8747311311211
    },
    tagObject: [],
  },
  data: {
    ContainerH: SCREEN_WIDTH * RATE,
    ScreenTotalW: SCREEN_WIDTH,
    ScreenTotalH: SCREEN_WIDTH * RATE * 0.8,
    TabBarH: SCREEN_WIDTH * RATE - SCREEN_WIDTH * RATE * 0.8,
    srcList: [],
    active: 0,
    fileId: '',
    arrayShow: false,
    overlayShow: false,
    modelHidden: true,
    modelUploadHidden: true,
    uploadMessage: "正在上传中，请耐心等待",
    labelArray: [{
      id: 'label0',
      num: 0,
      label: 'fuck',
      display: 'block',
      left: '30px',
      top: '52px'
    }],
    tabBarShow: false,
    tags: []
  },
  documentTouchMove: function () {},
  documentTouchEnd: function () {},
  onLoad: function (options) {
    let srcList = JSON.parse(decodeURIComponent(options.srcList))
    let type = JSON.parse(decodeURIComponent(options.type))
    this.setData({
      srcList: srcList
    })
    console.log(srcList);
    wx.cloud.init()


    wx.createSelectorQuery()
      .select('#c')
      .node()
      .exec((res) => {
        const canvas = THREE.global.registerCanvas(res[0].node)
        const canvasCtx = canvas.getContext('webgl')
        this.setData({
          canvasId: canvas._canvasId,
          canvasCtx
        })


        const camera = new THREE.PerspectiveCamera(80, canvas.width / canvas.height, 1, 2000);

        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({
          // 抗锯齿
          antialias: true
        });
        this.panorama.renderer = renderer
        renderer.setPixelRatio(pixelRatio)
        // 创造控件对象
        const controls = new OrbitControls(camera, renderer.domElement);
        // 控制镜头缩放，这里禁用了，因为是用正方体做的 除非能解决正方体的大小问题
        controls.enablePan = false
        controls.enableZoom = false
        controls.autoRotate = false
        camera.position.set(-0.1, 2, -5);
        // camera.position.set(0, 0, 0);


        // right left top bottom front back 
        // let sides = ['../../assets/room/r.jpg', '../../assets/room/l.jpg', '../../assets/room/u.jpg', '../../assets/room/d.jpg', '../../assets/room/f.jpg', '../../assets/room/b.jpg']
        let sides = this.data.srcList
        let materials = [];
        for (let i = 0; i < sides.length; i++) {
          let side = sides[i];
          let texture = new THREE.TextureLoader().load(side);
          texture.minFilter = THREE.LinearFilter
          materials.push(new THREE.MeshBasicMaterial({
            map: texture
          }));
        }
        // 这里物体的长宽高，我始终不知道该是多少
        let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(canvas.height, canvas.height, canvas.height), materials);
        // let mesh = new THREE.Mesh(new THREE.BoxGeometry(300, 300, 300, 7, 7, 7), materials);
        mesh.geometry.scale(-1, 1, 1);

        this.panorama.controls = controls
        this.panorama.camera = camera
        this.panorama.mesh = mesh
        this.panorama.scene = scene
        // 添加到场景

        // 点光源
        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-60, 40, -20);
        spotLight.castShadow = true;
        scene.add(spotLight);

        // 平行光
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
        directionalLight.position.set(-90, 80, -20);
        // 方向光指向对象网格模型mesh2，可以不设置，默认的位置是0,0,0
        // directionalLight.target = box;
        scene.add(directionalLight);

        // 环境光
        let ambient = new THREE.AmbientLight(0x444444);
        scene.add(ambient); //环境光对象添加到scene场景中

        // 红线x，绿线y，蓝线z
        let axisHelper = new THREE.AxisHelper(300);
        scene.add(axisHelper);
        this.showPrePoints()
        scene.add(mesh);

        // wx.startGyroscope({
        //   interval: "ui",
        // })
        // wx.onGyroscopeChange((res) => {
        //   console.log(res);
        // })

        function onWindowResize() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(canvas.width, canvas.height);
        }



        function render() {
          controls.update();
          if (wx.getStorageSync('addFlag')) {
            this.addTag()
            wx.removeStorageSync('addFlag')
          }
          this.data.tags.forEach((tagMesh) => {
            this.updateTag(tagMesh);
          });
          renderer.render(scene, camera);
          canvas.requestAnimationFrame(render.bind(this));
        }
        render.call(this)
      })
  },
  tagUpdate() {

  },
  onUnload: function () {
    THREE.global.unregisterCanvas(this.data.canvasId)
  },
  // documentTouchStart() {},
  touchStart(e) {
    THREE.global.touchEventHandlerFactory('canvas', 'touchstart')(e)
  },
  touchMove(e) {

    THREE.global.touchEventHandlerFactory('canvas', 'touchmove')(e)
  },
  longPress(e) {
    console.log('fuck');
    let raycasterCubeMesh;
    let raycaster = new THREE.Raycaster();
    let mouseVector = new THREE.Vector3();
    // console.log(this.data.ScreenTotalW, e.touches[0].clientX);
    // console.log(this.data.ScreenTotalH, e.touches[0].clientY);

    // 以屏幕中心为原点，计算二维坐标
    mouseVector.x = 2 * (e.touches[0].clientX / this.data.ScreenTotalW * 2) - 1;
    mouseVector.y = -2 * (e.touches[0].clientY / this.data.ScreenTotalH * 2) + 1;
    // console.log(mouseVector);
    raycaster.setFromCamera(mouseVector.clone(), this.panorama.camera);

    // 获取射线和canvas的整个mesh相交集合
    let intersects = raycaster.intersectObjects([this.panorama.mesh]);

    if (raycasterCubeMesh) {
      this.panorama.scene.remove(raycasterCubeMesh);
    }

    // 返回对象是一个数组，若长度大于0，说明获取到相交的3d对象
    if (intersects.length > 0) {
      let points = [];
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(intersects[0].point);
      // console.log(points);
      let mat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
      });
      let sphereGeometry = new THREE.SphereGeometry(10);
      raycasterCubeMesh = new THREE.Mesh(sphereGeometry, mat);
      raycasterCubeMesh.position.copy(intersects[0].point);
      this.panorama.scene.add(raycasterCubeMesh);
      this.panorama.activePoint = intersects[0].point;
      console.log(intersects[0].point);
    }
    // this.setData({
    //   modelHidden: false
    // })

    this.onPopConfirm()
  },
  showPrePoints() {
    // if (this.panorama.activePoint) {
    //   if (Array.isArray(this.panorama.activePoint)) {

    //   } else {
    //     console.log('仅一个');;
    //   }
    // }
  },
  onPopConfirm() {
    console.log('confirm');
    wx.navigateTo({
      url: '../../pages/label/label?position=' + encodeURIComponent(JSON.stringify(this.panorama.activePoint))
    })
    this.setData({
      modelHidden: true
    })
    console.log('back');
  },
  addTag() {
    console.log('sadasdasdasdasd');
    let tagMesh = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({
      color: 0xffff00
    }));
    // console.log(this.panorama.activePoint);
    tagMesh.position.copy(this.panorama.activePoint);
    // console.log(tagMesh.position);
    let len = this.data.labelArray.length
    tagMesh.num = len
    let title = wx.getStorageSync('labelArray').split(',').reverse()[0]
    console.log(title);
    this.data.labelArray.push({
      id: `label${len}`,
      num: len,
      label: title,
      display: 'block'
    })
    this.updateTag(tagMesh)
    // console.log(tagMesh);
    this.data.tags.push(tagMesh);
    console.log(this.data.tags);
  },
  updateTag(tagMesh) {

    if (this.checkOffset(tagMesh, this.panorama.camera)) {
      // console.log('不在范围内', tagMesh.num);
      let item = 'labelArray[' + tagMesh.num + '].display'
      this.setData({
        [item]: 'none'
      })
      // ctx.clearReact()
    } else {
      // console.log('在范围内', tagMesh.num);
      let position = this.coordinateProjection(tagMesh, this.panorama.camera);
      let item1 = 'labelArray[' + tagMesh.num + '].display'
      let item2 = 'labelArray[' + tagMesh.num + '].left'
      let item3 = 'labelArray[' + tagMesh.num + '].top'
      let item4 = 'labelArray[' + tagMesh.num + '].label'
      this.setData({
        [item1]: 'block',
        [item2]: position.x + 'px',
        [item3]: position.y + 'px',
        [item4]: this.data.labelArray[tagMesh.num].label
      })
    }
  },
  touchEnd(e) {
    console.log('end')
    THREE.global.touchEventHandlerFactory('canvas', 'touchend')(e)
  },
  tap(e) {
    let raycasterCubeMesh;
    let raycaster = new THREE.Raycaster();
    let mouseVector = new THREE.Vector3();
    let tags = [];
    // console.log(this.data.ScreenTotalW, e.touches[0].clientX);
    // console.log(this.data.ScreenTotalH, e.touches[0].clientY);

    // 以屏幕中心为原点，计算二维坐标
    mouseVector.x = 2 * (e.touches[0].clientX / this.data.ScreenTotalW * 2) - 1;
    mouseVector.y = -2 * (e.touches[0].clientY / this.data.ScreenTotalH * 2) + 1;
    // console.log(mouseVector);
    raycaster.setFromCamera(mouseVector.clone(), this.panorama.camera);

    // 获取射线和canvas的整个mesh相交集合
    let intersects = raycaster.intersectObjects([this.panorama.mesh]);

    if (raycasterCubeMesh) {
      this.panorama.scene.remove(raycasterCubeMesh);
    }
    // 返回对象是一个数组，若长度大于0，说明获取到相交的3d对象
    if (intersects.length > 0) {
      console.log('tap');
      console.log(intersects[0].point);
    }
  },
  onAutoPlayClick() {
    console.log('AutoPlayClick');
    console.log(this.panorama);
    this.panorama.controls.autoRotate = !this.panorama.controls.autoRotate
  },
  onFullScreenClick() {

  },
  onTabChange(e) {
    this.setData({
      active: e.detail
    })
  },
  onClickHide() {
    this.setData({
      overlayShow: false
    })
  },

  onUploadClick() {
    let pathName = wx.getStorageSync('panoramaName')
    this.setData({
      modelUploadHidden: false
    })
    this.data.srcList.map((item, index) =>
      this.uploadFilePromise(pathName, item, index)
    )
  },
  uploadFilePromise(pathName, url, index) {
    let type = ['r', 'l', 'u', 'd', 'f', 'b']
    wx.cloud.uploadFile({
      cloudPath: pathName + '/' + type[index] + '.jpg',
      filePath: url,
      success: res => {
        console.log(res);
        this.setData({
          fileId: res.fileID,
          uploadMessage: '上传成功，你的云id为' + this.data.fileId
        })
      }
    });
    // Dialog.alert({
    //   title: '上传到云',
    //   message: this.data.fileId ? '上传成功' + this.data.fileId : "loading",
    // }).then(() => {
    //   wx.setClipboardData({
    //     data: this.data.fileId,
    //     success(res) {
    //       wx.getClipboardData({
    //         success(res) {
    //           console.log(res.data) // data
    //         }
    //       })
    //     }
    //   })
    // });
  },
  onUploadCloudComplete() {
    wx.setClipboardData({
      data: this.data.fileId,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
        this.setData({
          modelUploadHidden: true
        })
      }
    })
  },
  onScreenClick() {

  },
  onPopCancel() {
    this.setData({
      modelHidden: true
    })
  },
  onSummaryClick() {
    wx.navigateTo({
      url: '../../pages/summary/summary',
    })
  },
  checkOffset(obj, camera) {
    let frustum = new THREE.Frustum(); //Frustum用来确定相机的可视区域
    let cameraViewProjectionMatrix = new THREE.Matrix4();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); //获取相机的法线
    frustum.setFromMatrix(cameraViewProjectionMatrix); //设置frustum沿着相机法线方向
    return !frustum.intersectsObject(obj);

    // let vector = new THREE.Vector3();
    // vector.copy(obj.position);
    // let tempV = vector.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    // return !((Math.abs(tempV.x) > 1) || (Math.abs(tempV.y) > 1) || (Math.abs(tempV.z) > 1));

  },
  coordinateProjection(obj, camera) {
    let vector = new THREE.Vector3();

    let widthHalf = 0.5 * this.data.ScreenTotalW / 2;
    let heightHalf = 0.5 * this.data.ScreenTotalH / 2;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    vector.x = (vector.x * widthHalf) + widthHalf;
    vector.y = -(vector.y * heightHalf) + heightHalf;

    // console.log(vector);
    return {
      x: vector.x,
      y: vector.y
    };
  }
})