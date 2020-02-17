export function removeFromArray(array, elem) {
  const idx = array.indexOf(elem);
  if (idx != -1) {
    array.splice(idx, 1);
    return array;
  }
  return array;
}
