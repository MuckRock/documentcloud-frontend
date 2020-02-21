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

  const resizer = ({ target }) => resize({ target, offset });

  el.addEventListener("input", resizer);

  resizer({ target: el });

  return {
    destroy: () => el.removeEventListener("input", resizer)
  };
}
