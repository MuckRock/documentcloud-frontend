export function removeFromArray(array, elem) {
  const idx = array.indexOf(elem);
  if (idx != -1) {
    array.splice(idx, 1);
  }
  return array;
}

export function uniquify(array, fieldAccess = x => x.id) {
  // Remove duplicates
  let unique = {};
  const results = [];
  // Iterate backwards so most recent objects override past ones
  for (let i = array.length - 1; i >= 0; i--) {
    const obj = array[i];
    const field = fieldAccess(obj);
    if (unique[field] == null) {
      results.push(obj);
      unique[field] = true;
    }
  }

  return results;
}

export function includes(array, elem, eq = (a, b) => a == b) {
  for (let i = 0; i < array.length; i++) {
    if (eq(array[i], elem)) return true;
  }
  return false;
}

export function index(array, elem, eq = (a, b) => a == b) {
  for (let i = 0; i < array.length; i++) {
    if (eq(array[i], elem)) return i;
  }
  return -1;
}

export function intersection(arrays, eq = (a, b) => a == b) {
  if (arrays.length == 0) return [];
  // Adapted from https://stackoverflow.com/a/59176460
  return arrays.reduce((a, b) => a.filter(elem => includes(b, elem, eq)));
}

export function arrayEq(x1, x2) {
  if (x1.length != x2.length) return false;
  for (let i = 0; i < x1.length; i++) {
    if (x1[i] != x2[i]) return false;
  }
  return true;
}

export function addToArrayIfUnique(array, newElem, eq = (a, b) => a == b) {
  for (let i = 0; i < array.length; i++) {
    if (eq(array[i], newElem)) return array;
  }
  return [...array, newElem];
}
