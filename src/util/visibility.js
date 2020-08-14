// Adapted from https://svelte.dev/repl/ead0f1fcd2d4402bbbd64eca1d665341?version=3.14.1

export function showIfFullyVisible(el) {
  const setVisible = visibility => {
    el.style.visibility = visibility ? 'visible' : 'hidden';
  };

  let observer = new IntersectionObserver(
    e => {
      if (e == null || e.length != 1) return;
      setVisible(
        e[0].intersectionRatio == 1 ||
        (e[0].intersectionRect.width > 0 && e[0].intersectionRect.width >= e[0].boundingClientRect.width));
    },
    {
      threshold: 1,
      margin: "30px 0 30px 0"
    }
  );
  observer.observe(el);

  return {
    destroy: () => {
      if (observer != null) observer.unobserve(el);
    },
  };
}
