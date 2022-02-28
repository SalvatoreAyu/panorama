export const coordinateProjection = function (obj, camera) {
  let vector = new THREE.Vector3();
  let widthHalf = 0.5 * renderer.context.canvas.width;
  let heightHalf = 0.5 * renderer.context.canvas.height;

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  vector.project(camera);

  vector.x = (vector.x * widthHalf) + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y
  };
}