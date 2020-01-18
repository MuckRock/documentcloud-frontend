export function documentDimensionUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${document.slug}.pagesize`;
}

export function pageImageUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
  }-p${pageNumber + 1}-large.gif?ts=${document.updatedAtTimestamp}`;
}

export function textUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
  }-p${pageNumber + 1}.txt?ts=${document.updatedAtTimestamp}`;
}
