import { Svue } from 'svue';

export const lazyComponent = new Svue({
  data() {
    return {
      home: null,
      app: null,
      viewer: null,
    }
  }
});

export function loadDefault() {
  import("@/pages/home/Empty").then((module) => {
    lazyComponent.default = module.default;
  });
}

export function loadHome() {
  import("@/pages/home/Home").then((module) => {
    lazyComponent.home = module.default;
  });
}

export function loadApp() {
  import("@/pages/app/App").then((module) => {
    lazyComponent.app = module.default;
  });
}

export function loadViewer() {
  import("@/pages/viewer/Viewer").then((module) => {
    lazyComponent.viewer = module.default;
  });
}

export function loadNote() {
  import("@/pages/embed/note/Note").then((module) => {
    lazyComponent.note = module.default;
  });
}

export function loadPage() {
  import("@/pages/embed/page/Page").then((module) => {
    lazyComponent.page = module.default;
  });
}

export function loadProject() {
  import("@/pages/embed/project/Project").then((module) => {
    lazyComponent.project = module.default;
  });
}
