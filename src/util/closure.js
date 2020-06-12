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

export function ignoreFirst(closure) {
  // Ignore first invocation of a function
  let first = true;
  return (...args) => {
    if (first) {
      first = false;
    } else {
      closure(...args);
    }
  }
}
