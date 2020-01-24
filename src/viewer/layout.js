import { Svue } from "svue";
import { viewer } from "./viewer";
import { wrapLoad } from "@/util/wrapLoad";
import { redactDocument } from "@/api/document";
import { showConfirm } from "@/manager/confirmDialog";
import { nav } from "@/router/router";

export const layout = new Svue({
  data() {
    return {
      headerHeight: 63,
      sidebarWidth: 350,
      footerHeight: 47,

      // TODO: handle load and error
      loading: false,
      error: null,

      action: null,
      editAnnotate: false,

      // Redactions
      rawRedaction: null,
      rawPendingRedactions: [],

      // Annotations
      rawAnnotation: null,
      annotationPending: false
    };
  },
  computed: {
    redacting(action) {
      return action == "redact";
    },
    annotating(action) {
      return action == "annotate";
    },
    pageCrosshair(redacting, annotating) {
      return redacting || annotating;
    },
    disableControls(action, editAnnotate) {
      return action != null || editAnnotate;
    },

    // Redactions
    currentRedaction(redacting, rawRedaction) {
      if (!redacting || rawRedaction == null) return null;

      return consolidateDragObject(rawRedaction);
    },
    pendingRedactions(redacting, rawPendingRedactions) {
      if (!redacting) return null;
      return rawPendingRedactions;
    },
    redactionsUndoable(pendingRedactions) {
      if (pendingRedactions == null) return false;
      return pendingRedactions.length >= 1;
    },
    allRedactions(currentRedaction, pendingRedactions) {
      if (currentRedaction == null) return pendingRedactions;
      return [...pendingRedactions, currentRedaction];
    },

    // Annotations
    currentAnnotation(annotating, rawAnnotation, annotationPending) {
      if (!annotating || rawAnnotation == null || annotationPending)
        return null;

      return consolidateDragObject(rawAnnotation);
    },
    shownAnnotation(rawAnnotation, annotationPending) {
      if (!annotationPending) return null;
      return consolidateDragObject(rawAnnotation);
    }
  }
});

function consolidateDragObject(dragObject) {
  const start = {
    x: Math.min(dragObject.start.x, dragObject.end.x),
    y: Math.min(dragObject.start.y, dragObject.end.y)
  };
  const end = {
    x: Math.max(dragObject.start.x, dragObject.end.x),
    y: Math.max(dragObject.start.y, dragObject.end.y)
  };

  return {
    page: dragObject.pageNumber,
    x1: start.x,
    x2: end.x,
    y1: start.y,
    y2: end.y,
    width: end.x - start.x,
    height: end.y - start.y
  };
}

export function enterRedactMode() {
  layout.rawRedaction = null;
  layout.rawPendingRedactions = [];
  layout.action = "redact";
}

export function enterAnnotateMode() {
  layout.annotationPending = false;
  layout.rawAnnotation = null;
  layout.action = "annotate";
}

export function enterEditAnnotateMode() {
  cancelActions();
  layout.editAnnotate = true;
}

export function pageDragStart(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = {
      pageNumber,
      start: { x, y },
      end: { x, y }
    };
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      pageNumber,
      start: { x, y },
      end: { x, y }
    };
  }
}

export function pageDragMove(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      ...layout.rawAnnotation,
      pageNumber,
      end: { x, y }
    };
  }
}

export function pageDragEnd(pageNumber, x, y) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
    pushRedaction();
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      ...layout.rawAnnotation,
      pageNumber,
      end: { x, y }
    };
    layout.annotationPending = true;
    enterEditAnnotateMode();
  }
}

function pushRedaction() {
  layout.rawPendingRedactions = [
    ...layout.rawPendingRedactions,
    layout.currentRedaction
  ];
  layout.rawRedaction = null;
}

export function redact() {
  showConfirm(
    "Confirm redactions",
    "Are you sure you wish to redact the current document? If you continue, the document viewer will close temporarily while the document reprocesses with the redactions in place. This change is irreversible.",
    "Continue",
    async () => {
      await wrapLoad(
        layout,
        async () => await redactDocument(viewer.id, layout.pendingRedactions)
      );
      cancelActions();
      nav("app");
    }
  );
}

export function undoRedaction() {
  if (layout.rawPendingRedactions.length > 0) {
    layout.rawPendingRedactions = layout.rawPendingRedactions.slice(
      0,
      layout.rawPendingRedactions.length - 1
    );
  }
}

export function cancelActions() {
  layout.action = null;
  layout.editAnnotate = false;
}

export function cancelAnnotation() {
  if (layout.editAnnotate) cancelActions();
}
