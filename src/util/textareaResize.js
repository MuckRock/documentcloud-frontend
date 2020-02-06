// Adapted from https://svelte.dev/repl/ead0f1fcd2d4402bbbd64eca1d665341?version=3.14.1

function resize({ target }) {
  target.style.height = "1px";

  target.style.height = +target.scrollHeight + 2 + "px";
}

export function textAreaResize(el) {
  resize({ target: el });
  el.style.overflow = "auto";
  el.style.boxSizing = "border-box";
  el.addEventListener("input", resize);

  return {
    destroy: () => el.removeEventListener("input", resize)
  };
}
