export function pageSizesFromSpec(pageSpec) {
  const parts = pageSpec.split(';');
  const sizes = [];
  for (let i = 0; i < parts.length; i++) {
    // Go through each part, e.g. 100x200:0-5
    const part = parts[i];
    const [size, range] = part.split(':');

    const [width, height] = size.split('x').map(parseFloat);
    const aspect = height / width;

    const rangeParts = range.split(',');
    for (let j = 0; j < rangeParts.length; j++) {
      const rangePart = rangeParts[j];
      if (rangePart.indexOf('-') != -1) {
        // Range
        const [start, end] = rangePart.split('-').map(x => parseInt(x, 10));
        for (let page = start; page <= end; page++) {
          sizes[page] = aspect;
        }
      } else {
        const page = parseInt(rangePart, 10);
        sizes[page] = aspect;
      }
    }
  }

  return sizes;
}
