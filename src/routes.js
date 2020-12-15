import NotFound from "@/pages/NotFound";
import { Svue } from 'svue';
import { lazyComponent, loadDefault, loadHome, loadApp, loadViewer, loadNote, loadPage, loadProject } from '@/util/lazyComponent';

export const routes = [
  NotFound,
  new Svue({
    data() {
      return {
        lazyComponent,
      }
    },
    computed: {
      default(lazyComponent) {
        return {
          path: "/",
          component: lazyComponent.default,
          get: loadDefault,
        };
      },
      home(lazyComponent) {
        return {
          path: "/home",
          component: lazyComponent.home,
          get: loadHome,
        }
      },
      app(lazyComponent) {
        return {
          path: "/app",
          component: lazyComponent.app,
          get: loadApp,
        }
      },
      viewer(lazyComponent) {
        return {
          path: "/documents/:id",
          component: lazyComponent.viewer,
          get: loadViewer,
        }
      },

      // Embeds
      note(lazyComponent) {
        return {
          path: "/documents/:id/annotations/:noteId",
          component: lazyComponent.note,
          get: loadNote
        }
      },
      page(lazyComponent) {
        return {
          path: "/documents/:id/pages/:page",
          component: lazyComponent.page,
          get: loadPage
        }
      },
      project(lazyComponent) {
        return {
          path: "/projects/:projectEmbedId",
          component: lazyComponent.project,
          get: loadProject
        }
      }
    }
  })
];
