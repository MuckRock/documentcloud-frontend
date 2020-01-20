import rlite from "rlite-router";
import { routes as routesObj } from "@/routes";
import { Svue } from "svue";

import { initDocuments } from "@/manager/documents";

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

export const routes = new Router(...routesObj);

export const router = new Svue({
  data() {
    return {
      currentUrl: "",
      routes
    };
  },
  computed: {
    resolvedRoute(currentUrl, routes) {
      return routes.resolve(currentUrl);
    }
  },
  watch: {
    resolvedRoute(route) {
      // Handle route switching
      if (route.name == "app") {
        initDocuments();
      }
    }
  }
});

export function getPath(to, params = null) {
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
