export function pageSizesFromSpec(pageSpec) {
  const parts = pageSpec.split(';');
  const sizes = [];
  for (let i = 0; i < parts.length; i++) {
    // Go through each part, e.g. 100x200:0-5
    const part = parts[i];
    const [size, range] = part.split(':');

    const [width, height] = size.split('x').map(parseFloat);
    const aspect = height / width;

    if (range.indexOf('-') != -1) {
      // Range
      const [start, end] = range.split('-').map(x => parseInt(x, 10));
      for (let page = start; page <= end; page++) {
        sizes[page] = aspect;
      }
    } else {
      const page = parseInt(range, 10);
      sizes[page] = aspect;
    }
  }

  return sizes;
}
