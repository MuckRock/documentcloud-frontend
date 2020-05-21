// Pan and zoom action that works on desktop and mobile

import { closeEnough } from "../util/epsilon";

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

  const events = [
    [node, ['wheel'], (e) => {
      e.preventDefault();


      const { x, y } = getRelativeCoordinates(e, workspaceElem);
      const { deltaX, deltaY } = e;
      // console.log("WHEEL", deltaX, deltaY);
      if (e.ctrlKey) {
        // Zoom
        if (deltaX == 0 && deltaY == 0) {
          // Zoom to scene
          zoomToScene([x, y]);
        } else {
          transform.scale(x, y, Math.exp(-deltaY * zoomIntensity));
        }
      } else {
        // Translate
        transform.translate(-deltaX, -deltaY, true, true);
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
        previousDelta = [currentPosition[0] - previousPosition[0], currentPosition[1] - previousPosition[1]];
        previousPosition = currentPosition;
        transform.translate(previousDelta[0], previousDelta[1], true, true);
      }
    }],
    [node, ['touchend'], (e) => {
      // Adapted from https://stackoverflow.com/a/32761323
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
      console.log('gesturestart');
      prevScale = 1;
    }],
    [node, ['gesturechange'], (e) => {
      console.log('gesturechange', e);
      const scale = e.scale / prevScale;
      const { x, y } = getRelativeCoordinates(e, workspaceElem);
      transform.scale(x, y, scale);
      prevScale = e.scale;
    }],
    [node, ['gestureend'], (e) => {
      console.log('gestureend', e);
    }],
  ];

  // Initialize and add events
  events.forEach(event => {
    event[1].forEach(eventType => {
      event[0].addEventListener(eventType, event[2], { passive: false });
    })
  });

  return {
    update({ workspace: newWorkspace, transform: newTransform, workspaceElem: newWorkspaceElem }) {
      workspace = newWorkspace;
      transform = newTransform;
      workspaceElem = newWorkspaceElem;
    },

    destroy() {
      events.forEach(event => {
        event[1].forEach(eventType => {
          event[0].removeEventListener(eventType, event[2], { passive: false });
        })
      });
    }
  };
}
