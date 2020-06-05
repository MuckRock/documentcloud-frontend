export function smoothify(fn) {
  return fn;
  // let timer = null;

  // return ((...args) => {
  //   if (timer != null) {
  //     cancelAnimationFrame(timer);
  //     timer = null;
  //   }

  //   timer = requestAnimationFrame(() => {
  //     timer = null;
  //     fn(...args);
  //   });
  // });
}
