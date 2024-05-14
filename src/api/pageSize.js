/**
 * Parses the page spec format (as "crunched" by the Python
 * [listcrunch](https://github.com/MuckRock/listcrunch) modules) and returns an
 * array of page aspect ratios.
 * @param {string} pageSpec A string encoding page dimensions in a compact format
 * @returns {Array<number>} An array of aspect ratios for each page
 */
export function pageSizesFromSpec(pageSpec) {
  // Handle empty page spec
  if (pageSpec.trim().length == 0) return [];

  const parts = pageSpec.split(";");
  const sizes = [];
  for (let i = 0; i < parts.length; i++) {
    // Go through each part, e.g. 100x200:0-5
    const part = parts[i];
    const [size, range] = part.split(":");

    const [width, height] = size.split("x").map(parseFloat);
    const aspect = height / width;

    const rangeParts = range.split(",");
    for (let j = 0; j < rangeParts.length; j++) {
      const rangePart = rangeParts[j];
      if (rangePart.indexOf("-") != -1) {
        // Parse a range
        const [start, end] = rangePart.split("-").map((x) => parseInt(x, 10));
        for (let page = start; page <= end; page++) {
          sizes[page] = aspect;
        }
      } else {
        // Parse a single page
        const page = parseInt(rangePart, 10);
        sizes[page] = aspect;
      }
    }
  }

  return sizes;
}

/**
 * Parse page_spec and return an array of [width, height] tuples
 *
 * @param {string} pageSpec A string encoding page dimensions in a compact format
 * @returns {[number, number][]}
 */
export function pageSizes(pageSpec) {
  // Handle empty page spec
  if (pageSpec.trim().length == 0) return [];

  const parts = pageSpec.split(";");

  return parts.reduce((sizes, part, i) => {
    const [size, range] = part.split(":");
    const [width, height] = size.split("x").map(parseFloat);

    range.split(",").forEach((rangePart) => {
      if (rangePart.includes("-")) {
        const [start, end] = rangePart.split("-").map((x) => parseInt(x, 10));
        for (let page = start; page <= end; page++) {
          sizes[page] = [width, height];
        }
      } else {
        const page = parseInt(rangePart, 10);
        sizes[page] = [width, height];
      }
    });

    return sizes;
  }, Array(parts.length));
}
