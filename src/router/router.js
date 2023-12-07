import rlite from "rlite-router";
import { writable, derived, get } from "svelte/store";
import { Svue } from "svue";

import NotFound from "../pages/NotFound.svelte";
import { lazyComponent } from "./lazyComponent.js";
import route from "./routes.js";

const endings = [".html", ".html"];

const FALLBACK_URL = "/app";

// updated in Main.svelte
// export const notFound = writable(NotFound);

// only referenced in Link component
export const routes = route(lazyComponent);

// internal
const mapping = Object.entries(routes).reduce((map, [name, route]) => {
  if (route.path != null) {
    map[route.path] = (props) => {
      return {
        name,
        props,
        component: route.component,
        get: route.get,
      };
    };
  }
  return map;
}, {});

// internal
const router = rlite(() => ({ component: NotFound }), mapping);

export const currentUrl = writable("");
export const backNav = writable(false);

const pastUrl = writable("");

export const resolvedRoute = derived(currentUrl, async ($currentUrl, set) => {
  // if ($currentUrl == null) return null;
  const resolved = resolve($currentUrl);
  if (resolved.component == null && resolved.get != null) {
    await Promise.resolve(resolved.get());
  }
  set(resolved);
});

function lookup(name) {
  return routes?.[name]?.path;
}

function resolve(path) {
  // Remove common endings
  path = path.split("#")[0];
  for (let i = 0; i < endings.length; i++) {
    const ending = endings[i];
    if (path.endsWith(ending)) {
      path = path.substr(0, path.length - ending.length);
      break;
    }
  }
  return router(path);
}

class Router extends Svue {
  constructor(notFound) {
    super({
      data() {
        return {
          notFound,
          routeFunc: () => {},
          pastUrl: null,
          backNav: false,
          currentUrl: null,
          lazyComponent,
        };
      },
      computed: {
        routes(routeFunc, lazyComponent) {
          return routeFunc(lazyComponent);
        },
        mapping(routes) {
          const mapping = {};
          for (const name in routes) {
            if (routes.hasOwnProperty(name)) {
              const route = routes[name];
              if (route.path != null) {
                mapping[route.path] = (props) => {
                  return {
                    name,
                    props,
                    component: route.component,
                    get: route.get,
                  };
                };
              }
            }
          }
          return mapping;
        },
        router(mapping, notFound) {
          return rlite(() => ({ component: notFound }), mapping);
        },
        resolvedRoute(currentUrl, router, lazyComponent) {
          if (currentUrl == null || router == null || lazyComponent == null)
            return null;
          const resolved = this.resolve(currentUrl);
          if (resolved.component == null && resolved.get != null) {
            resolved.get();
          }
          return resolved;
        },
      },
    });
  }

  lookup(name) {
    return this.routes?.[name]?.path;
  }

  resolve(path) {
    // Remove common endings
    path = path.split("#")[0];
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

export function getPath(to, params = null) {
  let path = lookup(to);
  if (params != null) {
    for (const param in params) {
      if (params.hasOwnProperty(param)) {
        path = path.replace(`:${param}`, params[param]);
        path = path.replace(`*${param}`, params[param]);
      }
    }
  }
  return path;
}

export function pushUrl(url) {
  // change current router path
  backNav.set(false);
  pastUrl.set(get(currentUrl));
  currentUrl.set(url);
  // push the path into web browser history API
  window.history.pushState(
    { path: url, dc: true },
    "",
    window.location.origin + url,
  );
}

// for hash routing in App.svelte and Viewer.svelte
export function setHash(hash) {
  const url = new URL(get(currentUrl), window.location.href);
  url.hash = hash;
  window.location.hash = hash;

  // tell that router that we've navigated
  pushUrl(url.pathname + url.search + url.hash);
}
/**
 * Set (and overwrite) the URL search
 *
 * @export
 * @param {URLSearchParams} qs Query args to set
 * @param {Array<String>} keep Keys to preserve
 */
export function setQS(qs, keep = []) {
  const url = new URL(get(currentUrl), window.location.href);
  const keys = Array.from(url.searchParams).filter(([k, v]) =>
    keep.includes(k),
  );

  url.search = "";
  [...keys, ...qs].forEach(([k, v]) => {
    url.searchParams.set(k, String(v).trim());
  });

  pushUrl(url.pathname + url.search + url.hash);
}

export function goBack(fallback = FALLBACK_URL) {
  if (get(pastUrl) != null) {
    window.history.back();
  } else {
    currentUrl.set(fallback);
    window.history.replaceState(
      { path: fallback },
      "",
      window.location.origin + fallback,
    );
  }
}

export function nav(to, params = null) {
  const path = getPath(to, params);
  pushUrl(path);
}

window.addEventListener("popstate", (e) => {
  const state = e.state || { dc: false };
  const isDc = state.dc;
  backNav.set(isDc == true);
});
