export function includes<T>(
  array: Array<T>,
  elem: T,
  eq = (a?: T, b?: T) => a == b,
) {
  for (let i = 0; i < array.length; i++) {
    if (eq(array[i], elem)) return true;
  }
  return false;
}

export function intersection<T>(
  arrays: Array<Array<T>>,
  eq = (a: T, b: T) => a == b,
) {
  if (arrays.length == 0) return [];
  // Adapted from https://stackoverflow.com/a/59176460
  return arrays.reduce((a, b) => a.filter((elem) => includes(b, elem, eq)));
}
