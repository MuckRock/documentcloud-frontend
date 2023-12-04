import { Svue } from "svue";
import Empty from "../pages/home/Empty.svelte";

export const lazyComponent = new Svue({
  data() {
    return {
      default: null,
      home: null,
      app: null,
      viewer: null,
      note: null,
      page: null,
      project: null,
      legacyRedirect: null,
      entities: null,
    };
  },
});

export function loadDefault() {
  if (lazyComponent.default !== null) return;
  lazyComponent.default = Empty;
}

export function loadHome() {
  if (lazyComponent.home !== null) return;
  import("@/pages/home/Home.svelte").then((module) => {
    lazyComponent.home = module.default;
  });
}

export function loadApp() {
  if (lazyComponent.app !== null) return;
  import("@/pages/app/App.svelte").then((module) => {
    lazyComponent.app = module.default;
  });
}

export function loadViewer() {
  if (lazyComponent.viewer !== null) return;
  import("@/pages/viewer/Viewer.svelte").then((module) => {
    lazyComponent.viewer = module.default;
  });
}

export function loadNote() {
  if (lazyComponent.note !== null) return;
  import("@/pages/embed/note/Note.svelte").then((module) => {
    lazyComponent.note = module.default;
  });
}

export function loadPage() {
  if (lazyComponent.page !== null) return;
  import("@/pages/embed/page/Page.svelte").then((module) => {
    lazyComponent.page = module.default;
  });
}

export function loadProject() {
  if (lazyComponent.project !== null) return;
  import("@/pages/embed/project/Project.svelte").then((module) => {
    lazyComponent.project = module.default;
  });
}

export function loadEntities() {
  if (lazyComponent.entities !== null) return;
  import("@/pages/entities/Entities.svelte").then((module) => {
    lazyComponent.entities = module.default;
  });
}

export function loadLegacyRedirect() {
  if (lazyComponent.legacyRedirect !== null) return;
  import("@/pages/legacy/Redirect.svelte").then((module) => {
    lazyComponent.legacyRedirect = module.default;
  });
}
