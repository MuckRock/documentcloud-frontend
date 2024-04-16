import axios from "axios";
import axiosRetry from "axios-retry";

import { DC_BASE } from "../config/config.js";

// Hook in failed request interceptor
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

export const CSRF_COOKIE_NAME = "csrftoken";
export const CSRF_HEADER_NAME = "X-CSRFToken";

export let cookiesEnabled = false;
try {
  document.cookie;
  cookiesEnabled = true;
} catch (e) {}

export function getCsrfToken() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const [key, token] =
    document.cookie
      ?.split(";")
      ?.map((c) => c.split("="))
      // in case there's spaces in the cookie string, trim the key
      ?.find(([k, v]) => k.trim() === CSRF_COOKIE_NAME) ?? [];

  return token;
}

const session = axios.create({
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
  withCredentials: cookiesEnabled,
});

session.interceptors.response.use(
  (response) => {
    // Keep response unchanged
    return response;
  },
  (error) => {
    // Do something with response error
    if (error.response && error.response.data) {
      return Promise.reject({
        errorData: error.response.data,
        status: error.response.status,
      });
    }
    return Promise.reject(error);
  },
);

const CACHE_LIMIT = 50;

export class SessionCache {
  constructor() {
    this.cached = [];
    this.cachedByUrl = {};
  }

  trimCache() {
    while (this.cached.length > CACHE_LIMIT) {
      const { url } = this.cached.shift();
      delete this.cachedByUrl[url];
    }
  }

  cache(url, contents) {
    this.cached.push({ url, contents });
    this.cachedByUrl[url] = contents;
    this.trimCache();
  }

  has(url) {
    return this.cachedByUrl.hasOwnProperty(url);
  }

  lookup(url) {
    if (this.has(url)) return this.cachedByUrl[url];
    return null;
  }
}

const sessionCache = new SessionCache();

// @ts-ignore
session.getStatic = async function getStatic(url) {
  if (sessionCache.has(url)) {
    return sessionCache.lookup(url);
  }
  let result;

  // If we are fetching a private asset, we authenticate through our own app server
  // We check this by checking if the URL starts with DC_BASE
  // We must send the session cookie with the first request, which should redirect
  // to a S3 link.  S3 will error out if sent the session cookie, so we must send
  // the location in the data of a 200 response instead of a normal 302 response.
  // On the second request, we do not sent the session cookie
  // If we are fetching a public asset, the first request is directly to S3.  In
  // that case we must not send the session cookie on the first request.
  if (url.startsWith(DC_BASE)) {
    result = await session.get(url).then((r) => r.data);
    let redirect = result.location;

    // text requests return a 200 but have a location property in the JSON result
    // this lets us send a second request to S3 without credentials
    if (redirect) {
      // note that this uses plain axios, not the session
      result = await axios.get(redirect).then((r) => r.data);
    }
  } else {
    result = await axios.get(url).then((r) => r.data);
  }

  sessionCache.cache(url, result);
  return result;
};

export default session;
