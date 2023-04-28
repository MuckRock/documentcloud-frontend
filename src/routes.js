import NotFound from "@/pages/NotFound.svelte";
import {
  loadDefault,
  loadHome,
  loadApp,
  loadViewer,
  loadNote,
  loadPage,
  loadProject,
  loadLegacyRedirect,
  loadEntities,
} from "@/util/lazyComponent.js";

export const routes = [
  NotFound,
  (lazyComponent) => ({
    default: {
      path: "/",
      component: lazyComponent.default,
      get: loadDefault,
    },
    home: {
      path: "/home",
      component: lazyComponent.home,
      get: loadHome,
    },
    app: {
      path: "/app",
      component: lazyComponent.app,
      get: loadApp,
    },

    addonList: {
      path: "/app/add-ons",
      component: lazyComponent.app,
      get: loadApp,
    },
    addonDetail: {
      path: "/app/add-ons/:org/:name",
      component: lazyComponent.app,
      get: loadApp,
    },
    addonEvent: {
      path: "/app/add-ons/:org/:name/:id",
      component: lazyComponent.app,
      get: loadApp,
    },

    viewer: {
      path: "/documents/:id",
      component: lazyComponent.viewer,
      get: loadViewer,
    },
    entity: {
      path: "/entities/:id",
      component: lazyComponent.entities,
      get: loadEntities,
    },

    // Embeds
    note: {
      path: "/documents/:id/annotations/:noteId",
      component: lazyComponent.note,
      get: loadNote,
    },
    page: {
      path: "/documents/:id/pages/:page",
      component: lazyComponent.page,
      get: loadPage,
    },
    project: {
      path: "/projects/:projectEmbedId",
      component: lazyComponent.project,
      get: loadProject,
    },

    // Legacy
    search: {
      path: "/search/*query",
      component: lazyComponent.legacyRedirect,
      get: loadLegacyRedirect,
    },

    publicSearch: {
      path: "/public/search/*query",
      component: lazyComponent.legacyRedirect,
      get: loadLegacyRedirect,
    },
  }),
];
