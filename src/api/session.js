import axios from "axios";

const CSRF_COOKIE_NAME = "csrftoken";
const CSRF_HEADER_NAME = "X-CSRFToken";

export let cookiesEnabled = false;
try {
  document.cookie;
  cookiesEnabled = true;
} catch (e) {
}

const session = axios.create({
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
  withCredentials: cookiesEnabled,
  headers: {
    "X-Requested-With": "XMLHttpRequest"
  }
});

session.interceptors.response.use(
  response => {
    // Keep response unchanged
    return response;
  },
  error => {
    // Do something with response error
    if (error.response && error.response.data) {
      return Promise.reject({ errorData: error.response.data });
    }
    return Promise.reject(error);
  }
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

  if (url.startsWith(process.env.DC_BASE)) {
    const redirectUrl = (await session.get(url)).data.location;
    const result = (await axios.get(redirectUrl)).data;
    sessionCache.cache(url, result);
    return result;
  } else {
    const result = (await axios.get(url)).data;
    sessionCache.cache(url, result);
    return result;
  }
};

export default session;
