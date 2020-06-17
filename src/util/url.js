/**
 * Splits a URL into its base and query component.
 * @param {string} url The URL from which to extract parts.
 */
export function urlParts(url) {
  const qIndex = url.indexOf("?");
  if (qIndex == -1) return [url, null];
  return [url.substr(0, qIndex), url.substr(qIndex + 1)];
}

/**
 * Join a URL, normalizing for slashes in between
 * @param  {...string} parts URL fragments to join
 */
export function urlJoin(...parts) {
  return parts.reduce((a, b) => {
    if (a.endsWith('/')) {
      a = a.substr(0, a.length - 1);
    }
    if (b.startsWith('/')) {
      b = b.substr(1);
    }
    if (a == '') return b;
    if (b == '') return a;
    return [a, b].join('/');
  }, '');
}

// Adapted from: https://stackoverflow.com/a/3855394
function getQueryStringParamsFromQuery(query) {
  if (query == null) return {};
  return query.split("&").reduce((params, param) => {
    let [key, value] = param.split("=");
    params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
    return params;
  }, {});
}

/**
 * Returns a map of query keys/values from a URL.
 * @param {string} url The URL from which to collect query params.
 */
export function getQueryStringParams(url) {
  const [_, query] = urlParts(url);
  return getQueryStringParamsFromQuery(query);
}

export function urlsEqual(url1, url2) {
  const [base1, query1] = urlParts(url1);
  const [base2, query2] = urlParts(url2);

  // Base URLs must match
  if (base1 != base2) return false;

  const qp1 = getQueryStringParamsFromQuery(query1);
  const qp2 = getQueryStringParamsFromQuery(query2);

  const keys1 = Object.keys(qp1);
  const keys2 = Object.keys(qp2);

  if (keys1.length != keys2.length) return false;

  keys1.sort();
  keys2.sort();

  for (let i = 0; i < keys1.length; i++) {
    const k1 = keys1[i];
    const k2 = keys2[i];
    if (k1 != k2) return false;
    if (qp1[k1] != qp2[k2]) return false;
  }
  return true;
}

export function currentUrl() {
  return window.location.pathname + window.location.search;
}

/**
 * Constructs a URL with specified query parameters
 * @param {string} baseUrl The base URL on which to add query parameters
 * @param {Object} params A dictionary of key-value pairs for each query parameter
 * @param {boolean} cleanSlate If true, wipes existing query parameters
 */
export function queryBuilder(baseUrl, params, cleanSlate = false) {
  if (baseUrl == null) baseUrl = currentUrl();
  const [url, query] = urlParts(baseUrl);
  const oldParams = cleanSlate ? {} : getQueryStringParamsFromQuery(query);

  // Overwrite old params with new params
  for (const prop in params) {
    if (params.hasOwnProperty(prop)) {
      oldParams[prop] = params[prop];
    }
  }

  let result = "";
  let prefix = "?";

  for (const prop in oldParams) {
    if (oldParams.hasOwnProperty(prop)) {
      const key = prop;
      const value = oldParams[key];

      // Skip undefined query params
      if (value == null) continue;

      result += `${prefix}${key}=${encodeURIComponent(value)}`;
      // Only the first prefix will be "?"
      prefix = "&";
    }
  }

  return `${url}${result}`;
}
