const baseApiUrl = process.env.DC_BASE + process.env.API;

export function apiUrl(url) {
  return `${baseApiUrl}${url}`;
}
