// Adapted from https://svelte.dev/repl/ead0f1fcd2d4402bbbd64eca1d665341?version=3.14.1

function resize({ target, offset = 2 }) {
  target.style.height = "1px";

  target.style.height = +target.scrollHeight + offset + "px";
}

export function textAreaResize(el, offset = 2) {
  if (offset != 0) {
    el.style.overflow = "auto";
    el.style.boxSizing = "border-box";
  }

  const resizer = () => resize({ target: el, offset });

  el.addEventListener("input", resizer);
  window.addEventListener("resize", resizer);

  resizer();

  return {
    destroy: () => {
      el.removeEventListener("input", resizer);
      window.removeEventListener("resize", resizer);
    },
  };
}
