import { Svue } from "svue";
import { viewer, updateNote, addNote, removeNote } from "./viewer";
import { wrapLoad } from "@/util/wrapLoad";
import { redactDocument, searchDocument } from "@/api/document";
import { showConfirm } from "@/manager/confirmDialog";
import { nav } from "@/router/router";
import {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation
} from "@/api/annotation";
import { Note } from "@/structure/note";

export const layout = new Svue({
  data() {
    return {
      // Height of header row
      headerHeight: 36,
      baseSidebarWidth: 350,
      // Height of footer row
      footerHeight: 36,

      // Show the title in the header (compact=false)
      compact: false,
      // In embedded mode
      embed: false,
      // Whether to display sidebar
      showSidebar: true,

      loading: false,
      error: null,

      action: null,
      displayedAnnotation: null,
      displayedAnnotationElemRaw: null,
      annotateMode: "view",

      // Redactions
      rawRedaction: null,
      rawPendingRedactions: [],

      // Annotations
      rawAnnotation: null,
      annotationPending: false,
      defaultAnnotationAccess: "private",
      hoveredNote: null,

      // Sections
      showEditSections: false,

      // Search
      search: null,
      searchPending: false,
      searchHighlights: null,
      searchPages: null
    };
  },
  computed: {
    sidebarWidth(baseSidebarWidth, showSidebar) {
      return showSidebar ? baseSidebarWidth : 0;
    },
    displayAnnotate(displayedAnnotation) {
      return displayedAnnotation != null;
    },
    displayedAnnotationElem(displayedAnnotation, displayedAnnotationElemRaw) {
      if (displayedAnnotation == null) return null;
      return displayedAnnotationElemRaw;
    },
    redacting(action) {
      return action == "redact";
    },
    annotating(action) {
      return action == "annotate";
    },
    searching(action) {
      return action == "search";
    },
    pageCrosshair(redacting, annotating) {
      return redacting || annotating;
    },
    disableControls(action, displayAnnotate) {
      return action != null || displayAnnotate;
    },
    nomove(action) {
      // Don't allow touchmove when an action is being applied
      return action != null;
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
    shownEditAnnotation(rawAnnotation, annotationPending) {
      if (!annotationPending) return null;
      return consolidateDragObject(rawAnnotation);
    },

    // Search
    totalResults(searchHighlights, searchPages) {
      if (searchHighlights == null || searchPages == null) return 0;
      let sum = 0;
      for (let i = 0; i < searchPages.length; i++) {
        const { page } = searchPages[i];
        sum += searchHighlights[page].length;
      }
      return sum;
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

  return new Note({
    page_number: dragObject.pageNumber,
    x1: start.x,
    x2: end.x,
    y1: start.y,
    y2: end.y
  });
}

export function annotationValid(annotation) {
  if (annotation.x2 <= annotation.x1) return false;
  if (annotation.y2 <= annotation.y1) return false;
  return true;
}

export function enterEditAnnotateMode(annotation) {
  cancelActions();
  if (!annotationValid(annotation)) return;
  layout.annotateMode = "edit";
  layout.displayedAnnotation = annotation;
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
    enterEditAnnotateMode(layout.shownEditAnnotation);
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
  layout.displayedAnnotation = null;
  layout.showEditSections = false;
}

export function cancelAnnotation() {
  if (layout.displayAnnotate) cancelActions();
}

export function hideEditSections() {
  if (layout.showEditSections) cancelActions();
}

export async function updatePageAnnotation(
  noteId,
  docId,
  title,
  description,
  access,
  annotation
) {
  const newNote = await updateAnnotation(
    noteId,
    docId,
    annotation.page,
    title,
    description,
    access,
    annotation.x1,
    annotation.x2,
    annotation.y1,
    annotation.y2,
    viewer.me
  );
  updateNote(newNote);
  return newNote;
}

export async function createPageAnnotation(
  id,
  title,
  description,
  access,
  annotation
) {
  const newNote = await createAnnotation(
    id,
    annotation.page,
    title,
    description,
    access,
    annotation.x1,
    annotation.x2,
    annotation.y1,
    annotation.y2,
    viewer.me
  );
  addNote(newNote);
  return newNote;
}

export async function deletePageAnnotation(noteId, docId) {
  showConfirm(
    "Confirm delete",
    "Are you sure you wish to delete the current note?",
    "Continue",
    async () => {
      await deleteAnnotation(docId, noteId);
      removeNote({ id: noteId });
      cancelActions();
    }
  );
}

export async function startSearch(query) {
  layout.search = query;
  layout.searchPending = true;
  layout.searchHighlights = null;
  layout.searchPages = null;

  const { highlights, pages } = await searchDocument(query, viewer.id);
  if (highlights != null) {
    layout.searchHighlights = highlights;
    layout.searchPages = pages;
  }
  layout.searchPending = false;
  return highlights != null;
}

export function clearSearch() {
  layout.search = "";
  layout.searchPending = false;
  layout.searchHighlights = null;
  layout.searchPages = null;
}
