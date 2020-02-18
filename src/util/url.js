/**
 * Splits a URL into its base and query component.
 * @param {string} url The URL from which to extract parts.
 */
export function urlParts(url) {
  const qIndex = url.indexOf("?");
  if (qIndex == -1) return [url, null];
  return [url.substr(0, qIndex), url.substr(qIndex + 1)];
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
