import axios from "axios";
import axiosRetry from "axios-retry";

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

  const [key, token] = document.cookie
    .split(";")
    .map((c) => c.split("="))
    .find(([k, v]) => k === CSRF_COOKIE_NAME);

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

session.getStatic = async function getStatic(url) {
  if (sessionCache.has(url)) return sessionCache.lookup(url);

  const result = (await axios.get(url)).data;
  sessionCache.cache(url, result);
  return result;
};

export default session;
