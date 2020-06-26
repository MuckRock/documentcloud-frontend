import { layout } from "./layout";
// import { changeMode } from "./renderer";

function changeMode() {
  // TODO: implement
}

export function enterRedactMode() {
  changeMode("image");
  layout.rawRedaction = null;
  layout.rawPendingRedactions = [];
  layout.action = "redact";
}

export function enterAnnotateMode() {
  changeMode("image");
  layout.annotationPending = false;
  layout.rawAnnotation = null;
  layout.action = "annotate";
}

export function enterSectionsMode() {
  layout.showEditSections = true;
}
