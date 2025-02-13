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
  const sizes: number[] = [];
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
 * @example "612.0x792.0:0-427,429-431,433-447;611.9999389648438x792.0:428,432"
 * @returns {[number, number][]}
 */
export function pageSizes(pageSpec: string): [number, number][] {
  // Handle empty page spec
  if (pageSpec.trim().length == 0) return [];

  const parts = pageSpec.split(";");

  return parts.reduce((sizes, part) => {
    const [size, ranges] = part.split(":");
    if (!size || !ranges) return sizes;

    const [width, height] = size.split("x").map(parseFloat);
    if (!width || !height) return sizes;

    ranges.split(",").forEach((rangePart) => {
      if (rangePart.includes("-")) {
        const [start, end] = rangePart.split("-").map((x) => parseInt(x, 10));
        if (start === undefined || end === undefined) return;

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
