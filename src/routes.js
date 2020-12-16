import NotFound from "@/pages/NotFound";
import { Svue } from 'svue';
import { lazyComponent, loadDefault, loadHome, loadApp, loadViewer, loadNote, loadPage, loadProject } from '@/util/lazyComponent';

export const routes = [
  NotFound,
  lazyComponent => ({
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
    viewer: {
      path: "/documents/:id",
      component: lazyComponent.viewer,
      get: loadViewer,
    },

    // Embeds
    note: {
      path: "/documents/:id/annotations/:noteId",
      component: lazyComponent.note,
      get: loadNote
    },
    page: {
      path: "/documents/:id/pages/:page",
      component: lazyComponent.page,
      get: loadPage
    },
    project: {
      path: "/projects/:projectEmbedId",
      component: lazyComponent.project,
      get: loadProject
    }
  })
];
