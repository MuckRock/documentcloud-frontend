import { IMAGE_WIDTHS } from "../config/config.js";

export function documentDimensionUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${document.slug}.pagesize`;
}

/**
 * Returns the desired page image size (e.g. "large", "normal", "small") given
 * a desired width to render at.
 * @param {number} desiredWidth The desired width of the page image.
 */
function getDesiredSize(desiredWidth) {
  for (let i = 0; i < IMAGE_WIDTHS.length; i++) {
    const [width, name] = IMAGE_WIDTHS[i];
    // @ts-ignore
    if (desiredWidth <= width) return name;
  }
  return IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1][1];
}

export function pageImageUrl(document, pageNumber, desiredWidth) {
  // Incorporate device's DPI into scaling to avoid blurring.
  const size = getDesiredSize(desiredWidth);

  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
  }-p${pageNumber + 1}-${size}.gif?ts=${document.updatedAtTimestamp}`;
}

export function textUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
  }-p${pageNumber + 1}.txt?ts=${document.updatedAtTimestamp}`;
}

export function jsonUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${document.slug}.txt.json?ts=${document.updatedAtTimestamp}`;
}

export function selectableTextUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
  }-p${pageNumber + 1}.position.json?ts=${document.updatedAtTimestamp}`;
}
