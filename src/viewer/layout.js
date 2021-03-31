import { Svue } from "svue";
import { viewer, updateNote, addNote, removeNote } from "./viewer";
import { truthyParamValue } from '@/util/url';
import { wrapLoad } from "@/util/wrapLoad";
import { getDocument, redactDocument, searchDocument, modifyDocument } from "@/api/document";
import { search } from '@/search/search';
import { showConfirm } from "@/manager/confirmDialog";
import { markAsDirty, documents } from '@/manager/documents';
import { router } from "@/router/router";
import {
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
} from "@/api/annotation";
import { Note } from "@/structure/note";
import { DEFAULT_EXPAND } from "../api/common";
import { inIframe } from '@/util/iframe';
import { modification } from "./modification/modification";

// A little bigger than normal mobile break to hide sidebar in narrow viewports
export const MOBILE_BREAKPOINT = 800;

export const layout = new Svue({
  data() {
    return {
      router,
      viewer,

      // Height of header row
      headerHeight: 36,
      baseSidebarWidth: 350,
      // Height of footer row
      footerHeight: 36,

      // Show the title in the header (title=true)
      title: true,
      // In embedded mode
      embed: false,
      // Whether to display sidebar
      showSidebar: document.body.offsetWidth >= MOBILE_BREAKPOINT,

      loading: false,
      error: null,
      viewerInitialized: false,
      viewerInitializeAction: null,

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

      // Document information
      showInfo: false,
      showData: false,
      showAccess: false,

      // Sections
      showEditSections: false,

      // Search
      search: null,
      searchExpanded: false,
      searchPending: false,
      searchHighlights: null,
      searchPages: null,

      // Embed
      embedDocument: null,
      embedNote: null,
      embedContext: "viewer",

      // Modify
      showInsertDialog: false,
    };
  },
  watch: {
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      if (route != null && route.name != "viewer") {
        reset();
      } else if (route != null && route.name == "viewer") {
        this.embed = inIframe() || truthyParamValue(route.props.embed);
        this.title = !this.embed || truthyParamValue(route.props.title);
        const sidebarValue = route.props.sidebar;
        if (sidebarValue != null) {
          this.showSidebar = truthyParamValue(sidebarValue);
        } else if (this.embed) {
          // Hide sidebar in embed mode by default unless explicitly set
          this.showSidebar = false;
        }
      }
    },
  },
  computed: {
    pollEvents(viewer) {
      // Update document only if it is readable or pending (processing)
      if (viewer.document == null || !viewer.document.processing) return [];
      return [
        async () => {
          const doc = await getDocument(viewer.document.id, [
            DEFAULT_EXPAND,
            "notes",
            "sections",
            "notes.organization",
            "notes.user",
          ].join(","));
          viewer.document = doc;
          // Update embed document if possible
          if (
            this.embedDocument != null &&
            this.embedDocument.id == viewer.id
          ) {
            this.embedDocument = doc;
          }
        },
      ];
    },
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
    modifying(action) {
      return action == 'modify';
    },
    searching(action) {
      return action == "search";
    },
    selectNoteEmbed(action) {
      return action == 'selectnote';
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
    },
    showEmbedDialog(embedDocument, selectNoteEmbed) {
      return embedDocument != null && !selectNoteEmbed;
    },

    dialogShown(showInfo, showData, showAccess, showEditSections, showEmbedDialog) {
      return showInfo || showData || showAccess || showEditSections || showEmbedDialog;
    }
  },
});

// Loading
export function initializeViewer() {
  layout.viewerInitialized = true;
  if (layout.viewerInitializeAction != null) layout.viewerInitializeAction();
}

export function setViewerInitializeAction(action) {
  layout.viewerInitializeAction = action;
  if (layout.viewerInitialized) {
    layout.viewerInitializeAction();
  }
}

// Annotations/redactions
function consolidateDragObject(dragObject) {
  if (dragObject.start == null) return new Note({ page_number: dragObject.pageNumber });
  const start = {
    x: Math.min(dragObject.start.x, dragObject.end.x),
    y: Math.min(dragObject.start.y, dragObject.end.y),
  };
  const end = {
    x: Math.max(dragObject.start.x, dragObject.end.x),
    y: Math.max(dragObject.start.y, dragObject.end.y),
  };

  return new Note({
    page_number: dragObject.pageNumber,
    x1: start.x,
    x2: end.x,
    y1: start.y,
    y2: end.y,
  });
}

export function annotationValid(annotation) {
  if (annotation.isPageNote) return true;
  if (annotation.x2 <= annotation.x1) return false;
  if (annotation.y2 <= annotation.y1) return false;
  return true;
}

export function enterEditAnnotateMode(annotation) {
  simpleCancelActions();
  if (!annotationValid(annotation)) return;
  layout.annotateMode = "edit";
  layout.displayedAnnotation = annotation;
}

export function pageDragStart(pageNumber, { x, y }) {
  if (layout.redacting) {
    layout.rawRedaction = {
      pageNumber,
      start: { x, y },
      end: { x, y },
    };
    return true;
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      pageNumber,
      start: { x, y },
      end: { x, y },
    };
    return true;
  }
  return false;
}

export function pageDragMove(pageNumber, { x, y }) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
    return true;
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      ...layout.rawAnnotation,
      pageNumber,
      end: { x, y },
    };
    return true;
  }
  return false;
}

export function pageDragEnd(pageNumber, { x, y }) {
  if (layout.redacting) {
    layout.rawRedaction = { ...layout.rawRedaction, pageNumber, end: { x, y } };
    pushRedaction();
    return true;
  } else if (layout.annotating) {
    layout.rawAnnotation = {
      ...layout.rawAnnotation,
      pageNumber,
      end: { x, y },
    };
    layout.annotationPending = true;
    enterEditAnnotateMode(layout.shownEditAnnotation);
    return true;
  }
  return false;
}

export function startPageNote(pageNumber) {
  layout.rawAnnotation = {
    pageNumber
  };
  layout.annotationPending = true;
  enterEditAnnotateMode(layout.shownEditAnnotation);
}

function pushRedaction() {
  layout.rawPendingRedactions = [
    ...layout.rawPendingRedactions,
    layout.currentRedaction,
  ];
  layout.rawRedaction = null;
}

export function redact() {
  showConfirm(
    "Confirm redactions",
    "Are you sure you wish to redact the current document? If you continue, the document viewer will be inaccessible temporarily while the document reprocesses with the redactions in place. This change is irreversible.",
    "Continue",
    async () => {
      await wrapLoad(
        layout,
        async () => await redactDocument(viewer.id, layout.pendingRedactions)
      );
      // Update document as pending
      viewer.document.doc = {
        ...viewer.document.doc,
        status: "pending",
      };
      viewer.document = viewer.document;
      await markAsDirty([viewer.id]);
      simpleCancelActions();
    }
  );
}

export function modify(modification, callback) {
  showConfirm(
    "Apply modifications",
    "Are you sure you wish to modify the current document? If you continue, the document viewer will be inaccessible temporarily while the document reprocesses with the modifications. This change is irreversible.",
    "Continue",
    async () => {
      const json = modification.modifySpec.json();
      await wrapLoad(
        layout,
        async () => await modifyDocument(viewer.id, json)
      );
      // Update document as pending
      viewer.document.doc = {
        ...viewer.document.doc,
        status: "pending",
      };
      viewer.document = viewer.document;
      await markAsDirty([viewer.id]);
      modification.clear();
      callback();
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

export function simpleCancelActions(callback = null) {
  // Clear modifications
  if (modification.uncommittedChanges) {
    showConfirm(
      "Confirm close",
      "You will lose all your unapplied modifications. Are you sure you want to proceed?",
      "Continue",
      () => {
        modification.clear();
        simpleCancelActions(callback);
      }
    );
    return;
  }
  if (callback != null) callback();
  modification.clear();
  layout.action = null;
  layout.embedDocument = null;
  layout.embedNote = null;
  layout.displayedAnnotation = null;
  layout.showEditSections = false;
}

export function cancelAnnotation() {
  if (layout.displayAnnotate) simpleCancelActions();
}

export function hideEditSections() {
  if (layout.showEditSections) simpleCancelActions();
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
      simpleCancelActions();
    }
  );
}

// Search

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

function reset() {
  clearSearch();
  simpleCancelActions();
}

export function showEmbedFlow(document) {
  layout.embedNote = null;
  layout.embedDocument = document;
}

export function hideEmbedFlow() {
  layout.embedDocument = null;
}

export function hideDocumentInfo() {
  layout.showInfo = false;
}

export function hideDocumentData() {
  layout.showData = false;
}

export function hideAccess() {
  layout.showAccess = false;
}

export function openAccess(documents) {
  const document = documents[0];
  if (document == null || !document.editAccess || document.processing) {
    return;
  }
  layout.showAccess = true;
}

export function showInsertDialog() {
  const me = viewer.me;
  if (me != null) {
    documents.inDocumentPickerDialog = true;
    search.filePickerUser = me;
    layout.showInsertDialog = true;
  }
}

export function hideInsertDialog() {
  modification.insertDocumentAtPosition();
  layout.showInsertDialog = false;
  search.filePickerUser = null;
  documents.inDocumentPickerDialog = false;
}
