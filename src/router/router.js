import rlite from "rlite-router";
import { Svue } from "svue";

// import { initDocuments } from "@/manager/documents";

export class Router {
  constructor(notFound, routes) {
    this.notFound = notFound;
    this.routes = routes;

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
    return this.router(path);
  }
}

export const router = new Svue({
  data() {
    return {
      currentUrl: "",
      routes: null
    };
  },
  computed: {
    resolvedRoute(currentUrl, routes) {
      if (routes == null) return null;
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
  router.currentUrl = url;
  // push the path into web browser history API
  window.history.pushState({ path: url }, "", window.location.origin + url);
}

export function nav(to, params = null) {
  const path = getPath(to, params);
  pushUrl(path);
}
