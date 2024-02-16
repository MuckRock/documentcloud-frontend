import { timeoutify } from "@/util/closure.js";

export function informSize(
  element,
  useScrollDimension = true,
  updateStyleProps = false,
) {
  if (!element) return;

  // Inform a parent window about an embed size
  const update = () => {
    window.parent.postMessage(
      {
        width: Math.max(
          useScrollDimension ? element.scrollWidth : 0,
          element.offsetWidth,
        ),
        height: Math.max(
          useScrollDimension ? element.scrollHeight : 0,
          element.offsetHeight,
        ),
        updateStyleProps,
      },
      "*",
    );
  };

  // Trigger event now and any time the window resizes
  window.addEventListener("resize", timeoutify(update));
  update();
}

export function setupResizeEvent(iframe) {
  window.addEventListener("message", (event) => {
    if (event.source == iframe.contentWindow) {
      const { width, height, updateStyleProps } = event.data;
      if (width != null) {
        iframe.width = width;
      }
      if (height != null) {
        iframe.height = height;
        if (updateStyleProps) {
          // Set max height
          const existingMaxHeight = parseFloat(
            iframe.dataset.cachemaxheight || iframe.style.maxHeight,
          );
          const existingMinHeight = parseFloat(
            iframe.dataset.cacheminheight || iframe.style.minHeight,
          );
          if (
            !isNaN(existingMaxHeight) &&
            existingMaxHeight != null &&
            !isNaN(existingMinHeight) &&
            existingMinHeight != null
          ) {
            // Cache original maxheight
            iframe.dataset.cachemaxheight = existingMaxHeight;
            iframe.dataset.cacheminheight = existingMinHeight;
            iframe.style.maxHeight =
              "" + Math.min(existingMaxHeight, height) + "px";
            iframe.style.minHeight =
              "" + Math.max(existingMinHeight, height) + "px";
          } else {
            iframe.style.maxHeight = "" + height + "px";
            iframe.style.minHeight = "" + height + "px";
          }
        }
      }
    }
  });
}
