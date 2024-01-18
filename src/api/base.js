import { DC_BASE, API } from "../config/config.js";

export const baseApiUrl = DC_BASE + API;

export function apiUrl(url) {
  return `${baseApiUrl}${url}`;
}
