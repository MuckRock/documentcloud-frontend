import rlite from 'rlite-router';
import { routes as routesObj } from '@/routes';
import { Svue } from 'svue';

export class Router {
  constructor(notFound, routes) {
    this.notFound = notFound;
    this.routes = routes;

    const mapping = {};
    for (const name in routes) {
      if (routes.hasOwnProperty(name)) {
        const route = routes[name];
        mapping[route.path] = (props) => {
          return { name, props, component: route.component };
        }
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
      currentUrl: '',
      routes,
    }
  },
  computed: {
    resolvedRoute(currentUrl, routes) {
      return routes.resolve(currentUrl);
    }
  }
});
