export function removeFromArray(array, elem) {
  const idx = array.indexOf(elem);
  if (idx != -1) {
    array.splice(idx, 1);
    return array;
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
