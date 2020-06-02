// Pan and zoom action that works on desktop and mobile

import { closeEnough } from "@/util/epsilon";
import { normalizeWheel } from '@/util/wheel';
import { smoothify } from '@/util/closure';

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

const zoomIntensity = 0.007;

const DOUBLE_TAP_TIMEOUT = 300;

export function panZoom(node, { workspace, transform, workspaceElem }) {
  let previousPosition = null;
  let previousDelta = [0, 0];
  let prevScale = 1;
  let tappedTwice = false;

  const touchPosition = e => {
    return [e.touches[0].screenX, e.touches[0].screenY];
  };

  const zoomToScene = point => {
    const scene = workspace.sceneAtPoint(point);
    if (scene != null) transform.zoomToScene(scene);
  };

  const setContainerSize = smoothify((width, height) => {
    if (node.firstChild) {
      // Set width/height of scroll child
      if (!closeEnough(width, node.firstChild.offsetWidth) || !closeEnough(height, node.firstChild.offsetHeight)) {
        node.firstChild.style.width = `${width}px`;
        node.firstChild.style.height = `${height}px`;
      }
    }
  });

  const SCROLL_CLOSE_ENOUGH = 0.1;

  const setContainerScroll = smoothify((left, top) => {
    left = Math.max(left, 0);
    top = Math.max(top, 0);

    if (!closeEnough(left, node.scrollLeft, SCROLL_CLOSE_ENOUGH) || !closeEnough(top, node.scrollTop, SCROLL_CLOSE_ENOUGH)) {
      console.log("NOT ENOUGH", left - node.scrollLeft, top - node.scrollTop);
      matrixInitiatedScroll = true;
      node.scrollLeft = left;
      matrixInitiatedScroll = true;
      node.scrollTop = top;
    } else {
      console.log("CLOSE ENOUGH");
    }
  });

  let matrixInitiatedScroll = false;

  function transformSubscribe() {
    return transform.subscribe(() => {
      // Set child height / width
      const topLeft = transform.project([transform.xBounds[0], transform.yBounds[0]]);
      const bottomRight = transform.project([transform.xBounds[1], transform.yBounds[1]]);
      const width = bottomRight[0] - topLeft[0];
      const height = bottomRight[1] - topLeft[1];
      setContainerSize(width, height);

      // Set scroll position
      const viewportTopLeft = transform.project([transform.viewportBounds[0], transform.viewportBounds[1]]);
      setContainerScroll(viewportTopLeft[0] - topLeft[0], viewportTopLeft[1] - topLeft[1]);
    });
  }

  const events = [
    [node, ['scroll'], () => {
      // Don't accept scroll events while transforming
      if (matrixInitiatedScroll) {
        matrixInitiatedScroll = false;
        console.log("SCROLL BLOCKED");
        return;
      }

      const topPerc = node.scrollTop / node.scrollHeight;
      const heightPerc = node.offsetHeight / node.scrollHeight;
      const leftPerc = node.scrollLeft / node.scrollWidth;
      const widthPerc = node.offsetWidth / node.scrollWidth;

      transform.matrix = transform.fitPercents(leftPerc, topPerc, widthPerc, heightPerc);
    }],
    [node, ['wheel'], (e) => {
      if (e.ctrlKey) {
        // Zoom
        e.preventDefault();

        const { x, y } = getRelativeCoordinates(e, workspaceElem);
        const { deltaX, deltaY } = normalizeWheel(e);

        if (deltaX == 0 && deltaY == 0) {
          // Zoom to scene
          // TODO: implement
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

        previousDelta = [currentPosition[0] - previousPosition[0], currentPosition[1] - previousPosition[1]];
        previousPosition = currentPosition;
        transform.translate(previousDelta[0], previousDelta[1], true, true);
      }
    }],
    [node, ['touchend'], (e) => {
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
