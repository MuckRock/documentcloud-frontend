import { layout } from "./layout";
import { changeMode } from "./document";

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

export function enterSelectNoteMode() {
  changeMode("image");
  layout.action = "selectnote";
}

export function enterSectionsMode() {
  layout.showEditSections = true;
}
