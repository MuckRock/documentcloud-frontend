import { Svue } from "svue";
import { pageSizesFromSpec } from "@/api/pageSize";
import { getDocument, getMe } from "@/api/document";
import { getAnnotations } from "@/api/annotation";
import { router } from "@/router/router";

export const viewer = new Svue({
  data() {
    return {
      router,
      notes: [],
      document: null,
      id: null,
      me: null
    };
  },
  watch: {
    router() {
      const route = router.resolvedRoute;
      if (route != null && route.name == "viewer" && route.props != null) {
        this.id = route.props.id;
        return initViewer(route.props.id);
      }
    }
  },
  computed: {
    loaded(document, pageAspects, me) {
      return document != null && pageAspects != null && me != null;
    },
    orderedNotes(notes) {
      if (notes == null) return [];
      notes.sort((note1, note2) => {
        if (note1.page != note2.page) {
          return note1.page - note2.page;
        }
        if (note1.y1 != note2.y1) {
          return note1.y1 - note2.y1;
        }
        if (note1.x1 != note2.x1) {
          return note1.x1 - note2.x1;
        }
        // Notes are same exact position
        return 0;
      });
      return notes;
    },
    notesByPage(orderedNotes) {
      if (orderedNotes == null) return {};
      const index = {};
      orderedNotes.forEach(note => {
        const existing = index.hasOwnProperty(note.page)
          ? index[note.page]
          : [];
        index[note.page] = [...existing, note];
      });
      return index;
    },
    pageAspects(document) {
      if (document == null) return null;

      return pageSizesFromSpec(document.pageSpec);
    }
  }
});

export function updateNote(note) {
  viewer.notes = viewer.notes.map(oldNote => {
    if (oldNote.id == note.id) return note;
    return oldNote;
  });
}

export function addNote(note) {
  viewer.notes = [...viewer.notes, note];
}

export function removeNote(note) {
  viewer.notes = viewer.notes.filter(oldNote => oldNote.id != note.id);
}

function initViewer(id) {
  // Initialize the viewer.
  getDocument(id).then(doc => (viewer.document = doc));
  getAnnotations(id).then(notes => (viewer.notes = notes));
  getMe().then(me => (viewer.me = me));
}
