/**
 * Constructs a URL with specified query parameters
 * @param {string} baseUrl The base URL on which to add query parameters
 * @param {Object} params A dictionary of key-value pairs for each query parameter
 */
export function queryBuilder(baseUrl, params) {
  let prefix = '?';
  let result = '';
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = params[key];

    // Skip undefined query params
    if (value == null) continue;

    result += `${prefix}${key}=${encodeURIComponent(value)}`;
    // Only the first prefix will be "?"
    prefix = '&';
  }
  return `${baseUrl}${result}`;
}
