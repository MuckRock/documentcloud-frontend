// Pan and zoom action that works on desktop and mobile

import { closeEnough } from "../util/epsilon";

// Friction-based drag
const MOMENTUM_DRAG = 0.01;
const MOMENTUM_FACTOR = 1;

function getRelativeCoordinates(event, referenceElement) {
  const position = {
    x: event.pageX,
    y: event.pageY
  };

  const offset = {
    left: referenceElement.offsetLeft,
    top: referenceElement.offsetTop
  };

  let reference = referenceElement.offsetParent;

  while (reference) {
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent;
  }

  return {
    x: position.x - offset.left,
    y: position.y - offset.top
  };
}

const zoomIntensity = 0.01;

const DOUBLE_TAP_TIMEOUT = 300;

export function panZoom(node, { workspace, transform, workspaceElem }) {
  let previousPosition = null;
  let previousDelta = [0, 0];
  let prevScale = 1;
  let tappedTwice = false;

  let momentumParams = {
    active: false,
    startTime: null,
    startDeltas: [0, 0],
  };

  const momentum = ts => {
    if (!momentumParams.active) return;

    // Get start time if not set
    if (momentumParams.startTime == null) {
      momentumParams.startTime = ts;
      return requestAnimationFrame(ts => momentum(ts));
    }

    // Calculate new deltas with lerps
    const dt = (ts - momentumParams.startTime) / 1000;
    previousDelta = momentumParams.startDeltas.map(x => {
      return x * Math.pow(MOMENTUM_DRAG, dt * MOMENTUM_FACTOR);
    });

    // If done, stop momentum
    if (previousDelta.every(x => closeEnough(x, 0))) {
      momentumParams = { active: false, startTime: null, startDeltas: [0, 0] };
      return;
    };

    // Otherwise, translate and recurse
    transform.translate(previousDelta[0], previousDelta[1], true, true);
    return requestAnimationFrame(ts => momentum(ts));
  }

  const touchPosition = e => {
    return [e.touches[0].screenX, e.touches[0].screenY];
  };

  const zoomToScene = point => {
    const scene = workspace.sceneAtPoint(point);
    if (scene != null) transform.zoomToScene(scene);
  };

  let matrixInitiatedScroll = false;

  function transformSubscribe() {
    return transform.subscribe(() => {
      matrixInitiatedScroll = true;

      // Set child height / width
      const topLeft = transform.project([transform.xBounds[0], transform.yBounds[0]]);
      const bottomRight = transform.project([transform.xBounds[1], transform.yBounds[1]]);
      const width = bottomRight[0] - topLeft[0];
      const height = bottomRight[1] - topLeft[1];
      if (node.firstChild) {
        // Set width/height of scroll child
        node.firstChild.style.width = `${width}px`;
        node.firstChild.style.height = `${height}px`;
      }

      // Set scroll position
      const viewportTopLeft = transform.project([transform.viewportBounds[0], transform.viewportBounds[1]]);
      node.scrollLeft = viewportTopLeft[0] - topLeft[0];
      console.log("SCROLLLEFT", node.scrollLeft);
      node.scrollTop = viewportTopLeft[1] - topLeft[1];
    });
  }

  const events = [
    [node, ['scroll'], (e) => {
      // Don't accept scroll events while transforming
      if (matrixInitiatedScroll) {
        matrixInitiatedScroll = false;
        return;
      }

      const topPerc = node.scrollTop / node.scrollHeight;
      const bottomPerc = (node.scrollTop + node.offsetHeight) / node.scrollHeight;
      const leftPerc = node.scrollLeft / node.scrollWidth;
      const rightPerc = (node.offsetLeft + node.offsetWidth) / node.scrollWidth;

      transform.matrix = transform.fitPercents(leftPerc, topPerc, rightPerc, bottomPerc);
    }],
    [node, ['wheel'], (e) => {
      const { x, y } = getRelativeCoordinates(e, workspaceElem);
      const { deltaX, deltaY } = e;
      if (e.ctrlKey) {
        // Zoom
        e.preventDefault();
        if (deltaX == 0 && deltaY == 0) {
          // Zoom to scene
          zoomToScene([x, y]);
        } else {
          transform.scale(x, y, Math.exp(-deltaY * zoomIntensity));
        }
      }
    }],
    [node, ['touchstart'], (e) => {
      if (e.touches.length == 1) {
        // One finger pan gesture
        e.stopImmediatePropagation()
        e.preventDefault()
        previousPosition = touchPosition(e);
      }
    }],
    [node, ['touchmove'], (e) => {
      if (e.touches.length == 1) {
        // One finger pan gesture
        e.stopImmediatePropagation()
        e.preventDefault()
        const currentPosition = touchPosition(e);

        // Stop any momentum
        momentumParams = {
          active: false,
          startTime: null,
          startDeltas: [0, 0]
        };

        previousDelta = [currentPosition[0] - previousPosition[0], currentPosition[1] - previousPosition[1]];
        previousPosition = currentPosition;
        transform.translate(previousDelta[0], previousDelta[1], true, true);
      }
    }],
    [node, ['touchend'], (e) => {
      if (!closeEnough(previousDelta[0], 0) || !closeEnough(previousDelta[1], 0)) {
        const wasActive = momentumParams.active;
        momentumParams = {
          active: true,
          startTime: null,
          startDeltas: previousDelta.slice()
        };
        if (!wasActive) {
          requestAnimationFrame(ts => momentum(ts));
        }
      } else {
        momentumParams = {
          active: false,
          startTime: null,
          startDeltas: [0, 0]
        };
      }

      // Adapted from https://stackoverflow.com/a/32761323
      // Only trigger off of single touch events
      if (e.touches.length != 0 || e.changedTouches.length != 1) return;

      if (!tappedTwice) {
        tappedTwice = true;
        setTimeout(() => tappedTwice = false, DOUBLE_TAP_TIMEOUT);
        return false;
      }
      event.preventDefault();

      // Zoom to scene on double-tap
      const { x, y } = getRelativeCoordinates(e, workspaceElem);
      zoomToScene([x, y]);
    }],
    [node, ['gesturestart'], () => {
      prevScale = 1;
    }],
    [node, ['gesturechange'], (e) => {
      const scale = e.scale / prevScale;
      const { x, y } = getRelativeCoordinates(e, workspaceElem);
      transform.scale(x, y, scale);
      prevScale = e.scale;
    }],
  ];

  // Initialize and add events
  events.forEach(event => {
    event[1].forEach(eventType => {
      event[0].addEventListener(eventType, event[2], { passive: false });
    })
  });

  // Disable global touch action
  const prevTouchAction = getComputedStyle(document.body).touchAction;
  document.body.style.touchAction = 'none';

  let unsubscribe = transformSubscribe();

  return {
    update({ workspace: newWorkspace, transform: newTransform, workspaceElem: newWorkspaceElem }) {
      workspace = newWorkspace;
      transform = newTransform;
      workspaceElem = newWorkspaceElem;

      if (unsubscribe != null) unsubscribe();
      unsubscribe = transformSubscribe();
    },

    destroy() {
      events.forEach(event => {
        event[1].forEach(eventType => {
          event[0].removeEventListener(eventType, event[2], { passive: false });
        })
      });
      document.body.style.touchAction = prevTouchAction;
      // Unsubscribe from transform
      if (unsubscribe != null) unsubscribe();
    }
  };
}
