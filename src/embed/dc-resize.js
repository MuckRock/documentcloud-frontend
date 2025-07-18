import { EMBED_URL } from "@/config/embed.js";

window.addEventListener("message", ({ origin, data }) => {
  // normalize origins for checking
  if (new URL(origin).origin !== new URL(EMBED_URL).origin) return;

  // ensure all the data we need
  if (![data.width, data.height, data.href].every(Boolean)) return;

  // find all the iframe with this href
  const iframes = document.querySelectorAll(`iframe[src="${data.href}"]`);

  if (iframes.length === 0) {
    console.warn(`No iframe matched href: ${data.href}`);
  }

  iframes.forEach((iframe) => {
    Object.assign(iframe, {
      width: data.width,
      height: data.height,
    });

    iframe.style.aspectRatio = `${data.width} / ${data.height}`;
    iframe.dataset.resized = Date.now();
  });
});
