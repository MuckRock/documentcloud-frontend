import { Page } from "$lib/utils/page.svelte";

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

/**
 * Multiplier to convert PDF points (1/72 inch) to CSS pixels (1/96 inch)
 */
export const PT_TO_PX = 96 / 72;

/**
 * Create an array of Pages from a pageSpec string
 */
export function pagesFromSpec(pageSpec: string): Page[] {
  const pageDimensions = pageSizes(pageSpec);
  return pageDimensions.map(
    ([width, height], index) =>
      new Page({ index, width: width * PT_TO_PX, height: height * PT_TO_PX }),
  );
}
