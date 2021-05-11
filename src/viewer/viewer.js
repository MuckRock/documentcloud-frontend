import { Svue } from "svue";
import { getDocument } from "@/api/document";
import { getMe } from "@/api/orgAndUser";
import { router } from "@/router/router";
import { DEFAULT_EXPAND } from "../api/common";
import { inIframe } from "@/util/iframe";
import { loadViewerEditDialogs } from "@/pages/viewer/viewerEditDialogs";

function extractId(idSlug) {
  return parseInt(idSlug.split("-")[0]);
}

function collectNotes(orderedNotes, predicate) {
  if (orderedNotes == null) return {};
  const index = {};
  orderedNotes.forEach((note) => {
    if (!predicate(note)) return;
    const existing = index.hasOwnProperty(note.page) ? index[note.page] : [];
    index[note.page] = [...existing, note];
  });
  return index;
}

let viewerInitCache = {};

export const viewer = new Svue({
  data() {
    return {
      router,
      notes: null,
      sections: null,
      document: null,
      embed: inIframe(),
      id: null,
      me: null,
      loadedMe: false,

      // Set to true if document fails to load
      error: null,
      show404: false,
      showPending: false,
    };
  },
  watch: {
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      if (route != null && route.name == "viewer" && route.props != null) {
        this.id = extractId(route.props.id);
        if (route.props.embed == "1") {
          this.embed = true;
        } else {
          this.embed = inIframe();
        }
        if (viewerInitCache[this.id] == null) {
          initViewer(this.id);
          viewerInitCache[this.id] = true;
        }
        return;
      }
      if (route != null && route.name != "viewer") {
        // Reset cache and document
        viewerInitCache = {};
        this.document = null;
      }
    },
    document() {
      if (this.document != null && this.document.editAccess) {
        loadViewerEditDialogs();
      }
    },
  },
  computed: {
    orderedSections(sections) {
      if (sections == null) return null;
      return sections.sort((a, b) => a.page - b.page);
    },
    orderedSectionsAndNotes(orderedSections, orderedNotes) {
      if (orderedSections == null || orderedNotes == null) return null;
      let sectionIdx = 0;
      let noteIdx = 0;

      const results = [];

      while (
        sectionIdx < orderedSections.length ||
        noteIdx < orderedNotes.length
      ) {
        const currentSection = orderedSections[sectionIdx];
        const currentNote = orderedNotes[noteIdx];

        if (
          currentSection != null &&
          (currentNote == null || currentSection.page <= currentNote.page)
        ) {
          results.push({ type: "section", value: currentSection });
          sectionIdx++;
        } else {
          results.push({ type: "note", value: currentNote });
          noteIdx++;
        }
      }

      return results;
    },
    sectionsAndNotes(orderedSectionsAndNotes) {
      if (orderedSectionsAndNotes == null) return null;

      let currentSection = null;
      const results = [];

      for (let i = 0; i < orderedSectionsAndNotes.length; i++) {
        const chunk = orderedSectionsAndNotes[i];
        if (chunk.type == "section") {
          currentSection = {
            type: "section",
            section: chunk.value,
            children: [],
          };
          results.push(currentSection);
        } else {
          if (currentSection == null) {
            results.push({
              type: "note",
              note: chunk.value,
            });
          } else {
            currentSection.children.push({
              type: "note",
              note: chunk.value,
            });
          }
        }
      }

      return results;
    },
    loaded(document, pageAspects, notes, sections, loadedMe) {
      return (
        document != null &&
        pageAspects != null &&
        notes != null &&
        sections != null &&
        loadedMe
      );
    },
    orderedNotes(notes) {
      if (notes == null) return null;
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
      return collectNotes(orderedNotes, (note) => !note.isPageNote);
    },
    pageNotesByPage(orderedNotes) {
      return collectNotes(orderedNotes, (note) => note.isPageNote);
    },
    pageAspects(document) {
      if (document == null) return null;

      return document.pageSizes;
    },
    isVerified(me) {
      if (me == null) return false;
      return me.verified_journalist;
    },
  },
});

export function updateNote(note) {
  viewer.notes = viewer.notes.map((oldNote) => {
    if (oldNote.id == note.id) return note;
    return oldNote;
  });
}

export function addNote(note) {
  viewer.notes = [...viewer.notes, note];
}

export function removeNote(note) {
  viewer.notes = viewer.notes.filter((oldNote) => oldNote.id != note.id);
}

function initViewer(id) {
  // Initialize the viewer.
  getDocument(
    id,
    [
      DEFAULT_EXPAND,
      "notes",
      "sections",
      "notes.organization",
      "notes.user",
    ].join(","),
  )
    .then((doc) => {
      if (!doc.viewable) {
        viewer.showPending = true;
      }
      viewer.document = doc;
      viewer.notes = doc.notes;
      viewer.sections = doc.sections;
    })
    .catch((e) => {
      if (e.status != null && `${e.status}` == "404") {
        viewer.show404 = true;
      } else {
        viewer.error = e;
      }
    });

  if (viewer.embed) {
    viewer.me = null;
    viewer.loadedMe = true;
  } else {
    getMe()
      .then((me) => {
        viewer.me = me;
        viewer.loadedMe = true;
      })
      .catch(() => {
        viewer.me = null;
        viewer.loadedMe = true;
      });
  }
}
