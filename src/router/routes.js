import Empty from "../pages/home/Empty.svelte";

export default function route(lazyComponent) {
  return {
    default: {
      path: "/",
      component: Empty,
    },
    home: {
      path: "/home",
      get() {
        return import("../pages/home/Home.svelte").then(
          (module) => module.default,
        );
      },
      component: null, // set by get
    },
    app: {
      path: "/app",
      get() {
        return import("../pages/app/App.svelte").then(
          (module) => module.default,
        );
      },
    },

    viewer: {
      path: "/documents/:id",
      get() {
        return import("../pages/viewer/Viewer.svelte").then(
          (module) => module.default,
        );
      },
    },
    entity: {
      path: "/entities/:id",
      get() {
        return import("../pages/entities/Entities.svelte").then(
          (module) => module.default,
        );
      },
    },

    // Embeds
    note: {
      path: "/documents/:id/annotations/:noteId",
      get() {
        return import("../pages/embed/note/Note.svelte").then(
          (module) => module.default,
        );
      },
    },
    page: {
      path: "/documents/:id/pages/:page",
      get() {
        return import("../pages/embed/page/Page.svelte").then(
          (module) => module.default,
        );
      },
    },
    project: {
      path: "/projects/:projectEmbedId",
      get() {
        return import("../pages/embed/project/Project.svelte").then(
          (module) => module.default,
        );
      },
    },

    // Legacy
    search: {
      path: "/search/*query",
      get() {
        return import("@/pages/legacy/Redirect.svelte").then(
          (module) => module.default,
        );
      },
    },

    publicSearch: {
      path: "/public/search/*query",
      get() {
        return import("@/pages/legacy/Redirect.svelte").then(
          (module) => module.default,
        );
      },
    },
  };
}
