import rlite from "rlite-router";
import { Svue } from "svue";

const endings = ['.html', '.html'];

const FALLBACK_URL = '/app';

export class Router {
  constructor(notFound, routes) {
    this.notFound = notFound;
    this.routes = routes;
    this.pastUrl = null;
    this.backNav = false;

    const mapping = {};
    for (const name in routes) {
      if (routes.hasOwnProperty(name)) {
        const route = routes[name];
        mapping[route.path] = props => {
          return { name, props, component: route.component };
        };
      }
    }
    this.router = rlite(() => ({ component: notFound }), mapping);
  }

  lookup(name) {
    return this.routes[name].path;
  }

  resolve(path) {
    // Remove common endings
    path = path.split('#')[0];
    for (let i = 0; i < endings.length; i++) {
      const ending = endings[i];
      if (path.endsWith(ending)) {
        path = path.substr(0, path.length - ending.length);
        break;
      }
    }
    return this.router(path);
  }
}

export const router = new Svue({
  data() {
    return {
      currentUrl: null,
      routes: null
    };
  },
  computed: {
    resolvedRoute(currentUrl, routes) {
      if (currentUrl == null || routes == null) return null;
      return routes.resolve(currentUrl);
    }
  }
});

export function getPath(to, params = null) {
  const routes = router.routes;
  let path = routes.lookup(to);
  if (params != null) {
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        path = path.replace(`:${param}`, params[param]);
      }
    }
  }
  return path;
}

export function pushUrl(url) {
  // change current router path
  router.backNav = false;
  router.pastUrl = router.currentUrl;
  router.currentUrl = url;
  // push the path into web browser history API
  window.history.pushState({ path: url, dc: true }, "", window.location.origin + url);
}

export function goBack(fallback = FALLBACK_URL) {
  if (router.pastUrl != null) {
    window.history.back();
  } else {
    router.currentUrl = fallback;
    window.history.replaceState({ path: fallback }, "", window.location.origin + fallback)
  }
}

export function nav(to, params = null) {
  const path = getPath(to, params);
  pushUrl(path);
}

window.addEventListener('popstate', (e) => {
  const state = e.state || { dc: false };
  const isDc = state.dc;
  router.backNav = isDc == true;
});
