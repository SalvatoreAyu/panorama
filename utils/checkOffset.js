export const checkOffset = function (obj, camera) {
  let frustum = new THREE.Frustum(); //Frustum用来确定相机的可视区域
  let cameraViewProjectionMatrix = new THREE.Matrix4();
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); //获取相机的法线
  frustum.setFromMatrix(cameraViewProjectionMatrix); //设置frustum沿着相机法线方向

  return !frustum.intersectsObject(obj);
}