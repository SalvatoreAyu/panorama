# PerspectiveCamera 透视投影相机

1.  new THREE.PerspectiveCamera(fov,aspect,near,far)

- fov:摄像机视锥体垂直视野角度,0-180,默认 50
- aspect:摄像机视锥体长宽比,默认 1(正方形),推荐使用屏幕的宽高比
- near:摄像机视锥体近端面,默认 0.1,推荐 1
- far:摄像机视锥体远端面,默认 2000(视觉能看到的最远距离)

# mesh

1. 几何体是不会被渲染的，只有几何体和材质结合成网格(mesh)才会被渲染到屏幕上
2.

# Raycaster

1. new Raycaster(origin,direction,near,far)

- origin:光线投射的起点向量
- direction:光线投射的方向向量
- near:投射近点，0
- far:投射远点，无穷

2. setFromCamera(coords,camera) 用一个新的原点和方向向量来更新射线

- coords:鼠标的二维坐标,-1 到 1 之间
- camera:射线起点处的相机，即把射线起点设置在该相机位置处

3. intersectObject(object,recursive) 检测射线和物体之间的所有交叉点 返回一个交叉点对象数组

- object:检测和射线交叉的物体
- recursive:设置为 true 会检查所有后代
- 返回对象:[{ distance, point, face, faceIndex, indices, object }, … ]
- distance – 射线的起点到相交点的距离
  point – 在世界坐标中的交叉点
  face – 相交的面
  faceIndex – 相交的面的索引
  indices – 组成相交面的顶点索引
  object – 相交的对象
