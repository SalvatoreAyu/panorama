const onTouchStart = (event) => {
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
        case TOUCH.PAN:
          if (scope.enablePan === false) return;
          handleTouchStartPan(event);
          state = STATE.TOUCH_PAN;
          break;
        default:
          state = STATE.NONE;
      }
      break;
    case 2:
      switch (scope.touches.TWO) {
        case TOUCH.DOLLY_PAN:
          if (scope.enableZoom === false && scope.enablePan === false) return;

          handleTouchStartDollyPan(event);

          state = STATE.TOUCH_DOLLY_PAN;

          break;

        case TOUCH.DOLLY_ROTATE:
          if (scope.enableZoom === false && scope.enableRotate === false)
            return;

          handleTouchStartDollyRotate(event);

          state = STATE.TOUCH_DOLLY_ROTATE;

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
};