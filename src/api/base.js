export const baseApiUrl = import.meta.env.DC_BASE + import.meta.env.DC_API;

export function apiUrl(url) {
  return `${baseApiUrl}${url}`;
}
