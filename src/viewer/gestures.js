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

  let scrollPositions = {
    left: node.scrollLeft,
    top: node.scrollTop
  };

  const touchPosition = e => {
    return [e.touches[0].screenX, e.touches[0].screenY];
  };

  const momentum = ts => {
    if (!momentumParams.active) return;

    // Get start time if not set
    if (momentumParams.startTime == null) {
      momentumParams.startTime = ts;
      return requestAnimationFrame(ts => momentum(ts));
    }

    const SCROLL_CLOSE_ENOUGH = 0.0001;

    const setContainerScroll = smoothify((left, top, scrollInitated = false) => {
      left = Math.max(left, 0);
      top = Math.max(top, 0);

      if (scrollInitated) {
        scrollPositions = { left, top };
        return;
      }

      if (!closeEnough(left, scrollPositions.left, SCROLL_CLOSE_ENOUGH) || !closeEnough(top, scrollPositions.top, SCROLL_CLOSE_ENOUGH)) {
        console.log("NOT ENOUGH", left - scrollPositions.left, top - scrollPositions.top);
        scrollPositions = {
          left, top
        };
        matrixInitiatedScroll = true;
        node.scrollLeft = left;
        matrixInitiatedScroll = true;
        node.scrollTop = top;
      } else {
        console.log("CLOSE ENOUGH");
      }
    });

    let matrixInitiatedScroll = false;
    let scrollInitiatedTransform = false;

    function transformUpdate() {
      // Set child height / width
      const topLeft = transform.project([transform.xBounds[0], transform.yBounds[0]]);
      const bottomRight = transform.project([transform.xBounds[1], transform.yBounds[1]]);
      const width = bottomRight[0] - topLeft[0];
      const height = bottomRight[1] - topLeft[1];
      setContainerSize(width, height);

      // Set scroll position
      const viewportTopLeft = transform.project([transform.viewportBounds[0], transform.viewportBounds[1]]);
      setContainerScroll(viewportTopLeft[0] - topLeft[0], viewportTopLeft[1] - topLeft[1], scrollInitiatedTransform);
      if (scrollInitiatedTransform) {
        console.log("SCROLL INITIATED TRANSFORM");
      } else {
        console.log("NO SCROLL INITIATED TRANSFORM");
      }
      scrollInitiatedTransform = false;
    }

    function transformSubscribe() {
      return [
        transform.writables.matrix.subscribe(transformUpdate),
        transform.writables.viewportSize.subscribe(transformUpdate),
      ]
    }

    const events = [
      [node, ['wheel'], (e) => {
        e.preventDefault();

        scrollPositions = { left: node.scrollLeft, top: node.scrollTop };

        const topPerc = scrollPositions.top / node.scrollHeight;
        const heightPerc = node.offsetHeight / node.scrollHeight;
        const leftPerc = scrollPositions.left / node.scrollWidth;
        const widthPerc = node.offsetWidth / node.scrollWidth;

        scrollInitiatedTransform = true;
        console.log("CHANGE MATRIX");
        transform.matrix = transform.fitPercents(leftPerc, topPerc, widthPerc, heightPerc);
      }],
      [node, ['wheel'], (e) => {
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

    let unsubscribers = transformSubscribe();

    return {
      update({ workspace: newWorkspace, transform: newTransform, workspaceElem: newWorkspaceElem }) {
        workspace = newWorkspace;
        transform = newTransform;
        workspaceElem = newWorkspaceElem;

        if (unsubscribers != null) {
          unsubscribers.forEach(unsubscribe => unsubscribe());
        }
        unsubscribers = transformSubscribe();
      },

      destroy() {
        events.forEach(event => {
          event[1].forEach(eventType => {
            event[0].removeEventListener(eventType, event[2], { passive: false });
          })
        });
        document.body.style.touchAction = prevTouchAction;
        // Unsubscribe from transform
        if (unsubscribers != null) {
          unsubscribers.forEach(unsubscribe => unsubscribe());
        }
      }
    };
  }
