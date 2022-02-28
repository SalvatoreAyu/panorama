import {
    EventDispatcher,
    MOUSE,
    Quaternion,
    Spherical,
    TOUCH,
    Vector2,
    Vector3,
    global as window
} from "./three.weapp.min.js";
// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
let OrbitControls = function (object, domElement) {
    const STATE = {
        NONE: -1,
        ROTATE: 0,
        TOUCH_ROTATE: 3,
    };
    this.object = object;
    this.domElement = (domElement !== undefined) ? domElement : document;
    // Set to false to disable this control
    this.enabled = true;
    // "target" sets the location of focus, where the object orbits around
    // 此处即是相机的lookAt
    this.target = new Vector3();
    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;
    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians
    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to false to disable rotating
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60



    // Touch fingers
    this.touches = {
        ONE: TOUCH.ROTATE,
        TWO: TOUCH.DOLLY_PAN
    };
    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    //
    // public methods
    //
    this.getPolarAngle = function () {
        return spherical.phi;
    };
    this.getAzimuthalAngle = function () {
        return spherical.theta;
    };
    this.saveState = function () {
        scope.target0.copy(scope.target);
        scope.position0.copy(scope.object.position);
        scope.zoom0 = scope.object.zoom;
    };
    this.reset = function () {
        scope.target.copy(scope.target0);
        scope.object.position.copy(scope.position0);
        scope.object.zoom = scope.zoom0;
        scope.object.updateProjectionMatrix();
        scope.dispatchEvent(changeEvent);
        scope.update();
        state = STATE.NONE;
    };
    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function () {
        let offset = new Vector3();
        // so camera.up is the orbit axis
        // 根据相机的up轴指向和y轴来求出一个表示绕垂直这两向量形成的平面的向量的转动夹角
        // 这个四元数表示初始时相机up与y轴的夹角
        let quat = new Quaternion()
            .setFromUnitVectors(object.up, new Vector3(0, 1, 0));
        let quatInverse = quat.clone()
            .inverse();
        let lastPosition = new Vector3();
        let lastQuaternion = new Quaternion();
        return function update() {
            let position = scope.object.position;  //尚未变化的position，也即是相机位置
            offset.copy(position)
                .sub(scope.target);;// 形成一个从target=>position的向量

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);
            // angle from z-axis around y-axis
            spherical.setFromVector3(offset); //相机位置转化为球面坐标

            if (scope.autoRotate && state === STATE.NONE) {
                rotateLeft(getAutoRotationAngle());
            }


            // 对球坐标系做旋转,可以理解相机位置所对应的球上的点在运动
            spherical.theta += sphericalDelta.theta;
            spherical.phi += sphericalDelta.phi;


            // restrict theta to be between desired limits
            spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
            // restrict phi to be between desired limits
            spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

            // 控制球坐标系极坐标上下限，避免变换到phi的极点
            spherical.makeSafe();

            spherical.radius *= scale;
            // restrict radius to be between desired limits
            spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));
            // move target to panned location

            scope.target.add(panOffset);

            offset.setFromSpherical(spherical); // 球坐标转化为向量
            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);
            position.copy(scope.target)
                .add(offset);
            scope.object.lookAt(scope.target); //焦点不变

            sphericalDelta.set(0, 0, 0);
            panOffset.set(0, 0, 0);

            scale = 1;
            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            if (zoomChanged ||
                lastPosition.distanceToSquared(scope.object.position) > EPS ||
                8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
                scope.dispatchEvent(changeEvent);
                lastPosition.copy(scope.object.position);
                lastQuaternion.copy(scope.object.quaternion);
                zoomChanged = false;
                return true;
            }
            return false;
        };
    }();
    this.dispose = function () {
        scope.domElement.removeEventListener('touchstart', onTouchStart, false);
        scope.domElement.removeEventListener('touchend', onTouchEnd, false);
        scope.domElement.removeEventListener('touchmove', onTouchMove, false);
    };
    //
    // internals
    //
    let scope = this;
    let changeEvent = {
        type: 'change'
    };
    let startEvent = {
        type: 'start'
    };
    let endEvent = {
        type: 'end'
    };

    let state = STATE.NONE;
    let EPS = 0.000001;
    // current position in spherical coordinates
    let spherical = new Spherical();
    let sphericalDelta = new Spherical();
    let scale = 1;
    let panOffset = new Vector3();
    let zoomChanged = false;
    let rotateStart = new Vector2();
    let rotateEnd = new Vector2();
    let rotateDelta = new Vector2();

    function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }
    //
    // event callbacks - update the object state
    //

    function handleTouchStartRotate(event) {
        if (event.touches.length == 1) {
            rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            rotateStart.set(x, y);
        }
    }

    function handleTouchMoveRotate(event) {
        if (event.touches.length == 1) {
            rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        } else {
            let x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
            let y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);
            rotateEnd.set(x, y);
        }
        rotateDelta.subVectors(rotateEnd, rotateStart)
            .multiplyScalar(scope.rotateSpeed);
        let element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height
        rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);
        rotateStart.copy(rotateEnd);
    }

    function handleTouchEnd( /*event*/) {
        // no-op
    }

    function onTouchStart(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        switch (event.touches.length) {
            case 1:
                switch (scope.touches.ONE) {
                    case TOUCH.ROTATE:
                        if (scope.enableRotate === false) return;
                        handleTouchStartRotate(event);
                        state = STATE.TOUCH_ROTATE;
                        break;
                    default:
                        state = STATE.NONE;
                }
                break;
            default:
                state = STATE.NONE;
        }
        if (state !== STATE.NONE) {
            scope.dispatchEvent(startEvent);
        }
    }

    function onTouchMove(event) {
        if (scope.enabled === false) return;
        event.preventDefault();
        event.stopPropagation();
        switch (state) {
            case STATE.TOUCH_ROTATE:
                if (scope.enableRotate === false) return;
                handleTouchMoveRotate(event);
                scope.update();
                break;
            default:
                state = STATE.NONE;
        }
    }

    function onTouchEnd(event) {
        if (scope.enabled === false) return;
        handleTouchEnd(event);
        scope.dispatchEvent(endEvent);
        state = STATE.NONE;
    }
    //
    scope.domElement.addEventListener('touchstart', onTouchStart, false);
    scope.domElement.addEventListener('touchend', onTouchEnd, false);
    scope.domElement.addEventListener('touchmove', onTouchMove, false);
    // force an update at start
    this.update();
};
OrbitControls.prototype = Object.create(EventDispatcher.prototype);
OrbitControls.prototype.constructor = OrbitControls;

export {
    OrbitControls,
};