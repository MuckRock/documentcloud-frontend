import { ensureBounds } from "./bounds";
import {
  pageDragStart,
  pageDragMove,
  pageDragEnd,
} from "@/viewer/layout";

export function markup(node, pageNumber) {
  const getXY = (e, client = false, changedTouches = false) => {
    const touchAccessor = changedTouches ? "changedTouches" : "touches";
    if (e[touchAccessor] != null) {
      if (e[touchAccessor].length != 1) return null;
      const touch = e[touchAccessor][0];
      const { left, top } = node.getBoundingClientRect();
      const x = touch.clientX - left;
      const y = touch.clientY - top;
      return { x, y };
    } else {
      if (client) {
        const { left, top } = node.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        return { x, y };
      } else {
        return { x: e.offsetX, y: e.offsetY };
      }
    }
  };

  const normalize = ({ x, y }) => {
    x = ensureBounds(x, 0, node.offsetWidth);
    y = ensureBounds(y, 0, node.offsetHeight);
    return {
      x: x / node.offsetWidth,
      y: y / node.offsetHeight
    };
  };

  let down = false;

  const events = [
    [node, ['mousedown', 'touchstart'], e => {
      const data = getXY(e);
      if (data == null) return;
      down = true;
      pageDragStart(pageNumber, normalize(data));
    }],
    [window, ['mousemove', 'touchmove'], e => {
      if (!down) return;
      const data = getXY(e, true);
      if (data == null) return;
      pageDragMove(pageNumber, normalize(data));
    }],
    [window, ['mouseup', 'touchend'], e => {
      if (!down) return;
      down = false;
      const data = getXY(e, true, true);
      if (data == null) return;
      pageDragEnd(pageNumber, normalize(data));
    }],
  ];

  // Initialize and add events
  events.forEach(event => {
    event[1].forEach(eventType => {
      event[0].addEventListener(eventType, event[2], { passive: false });
    })
  });

  return {
    destroy() {
      events.forEach(event => {
        event[1].forEach(eventType => {
          event[0].removeEventListener(eventType, event[2], { passive: false });
        })
      });
    }
  }
}
