import { timeoutify } from '@/util/closure';

export function informSize(element, useScrollDimension = true) {
  // Inform a parent window about an embed size
  const update = () => {
    window.parent.postMessage({
      width: Math.max(useScrollDimension ? element.scrollWidth : 0, element.offsetWidth),
      height: Math.max(useScrollDimension ? element.scrollHeight : 0, element.offsetHeight)
    }, "*");
  };

  // Trigger event now and any time the window resizes
  window.addEventListener('resize', timeoutify(update));
  update();
}

export function setupResizeEvent(iframe) {
  window.addEventListener('message', (event) => {
    if (event.source == iframe.contentWindow) {
      const { width, height } = event.data;
      iframe.width = width;
      iframe.height = height;
    }
  });
}
