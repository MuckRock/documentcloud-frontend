import { pageSizesFromSpec } from "./pageSize";
import session from './session';

export function documentDimensionUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${
    document.slug
    }.pagesize`;
}

export async function getPageAspects(document) {
  const pageSpec = await session.getStatic(documentDimensionUrl(document));
  return pageSizesFromSpec(pageSpec);
}

export function pageImageUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
    }-p${pageNumber + 1}-large.gif`
}

export function textUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
    }-p${pageNumber + 1}.txt`
}
