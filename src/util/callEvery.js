export function callEvery(fn, times) {
  let count = 0;

  return () => {
    if (count++ % times == 0) {
      fn();
    }
  };
}

export function callEveryAsync(fn, times) {
  let count = 0;

  return async () => {
    if (count++ % times == 0) {
      await fn();
    }
  };
}
