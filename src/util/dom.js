export function elementInside(elem, parent) {
  if (elem == null) return false;
  if (elem == parent) return true;
  return elementInside(elem.parentNode, parent);
}
