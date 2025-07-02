import { EMBED_URL } from "@/config/embed.js";

window.addEventListener("message", ({ origin, data }) => {
  console.debug({ origin, data });
  // normalize origins for checking
  if (new URL(origin).origin !== new URL(EMBED_URL).origin) return;
  if (![data.width, data.height, data.href].every(Boolean)) return;

  // find all the iframe with this href
  const iframes = document.querySelectorAll(`iframe[src*="${data.href}"]`);

  iframes.forEach((iframe) => {
    Object.assign(iframe, {
      width: data.width,
      height: data.height,
    });

    iframe.style.aspectRatio = `${data.width} / ${data.height}`;
  });
});
