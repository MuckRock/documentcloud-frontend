export function smoothify(fn) {
  let timer = null;

  return (...args) => {
    if (timer != null) {
      cancelAnimationFrame(timer);
      timer = null;
    }

    timer = requestAnimationFrame(() => {
      timer = null;
      fn(...args);
    });
  };
}

export function timeoutify(fn, timeout = 100) {
  let timer = null;

  return (...args) => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, timeout);
  };
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
  };
}
