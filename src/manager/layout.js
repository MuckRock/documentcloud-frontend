import { Svue } from "svue";

// Used to calculate the most restricted level of access
// in a group of documents
const ACCESS_LEVELS = {
  public: 2,
  organization: 1,
  private: 0
};

export const layout = new Svue({
  data() {
    return {
      sidebarExpanded: false,
      loading: true,
      error: false,
      // Whether upload dialog should be shown
      uploading: false,
      // Whether a doc is checked or not
      selectedMap: {},

      // Custom dialogs
      renameOpen: false,

      // Which documents the access is being edited for
      accessEditDocuments: []
    };
  },
  computed: {
    selected(selectedMap) {
      return Object.values(selectedMap);
    },
    numSelected(selected) {
      return selected.length;
    },
    hasSelection(selected) {
      return selected.length > 0;
    },
    accessOpen(accessEditDocuments) {
      return accessEditDocuments.length > 0;
    },
    numAccessSelected(accessEditDocuments) {
      return accessEditDocuments.length;
    },
    defaultAccess(accessEditDocuments) {
      let minAccess = null;
      let minAccessRank = null;
      // Set to the most restricted level of access across all documents
      for (let i = 0; i < accessEditDocuments.length; i++) {
        const newAccess = accessEditDocuments[i].access;
        const newRank = ACCESS_LEVELS[newAccess];
        if (minAccessRank == null || newRank < minAccessRank) {
          minAccessRank = newRank;
          minAccess = newAccess;
        }
      }

      // Return the most restricted access level
      return minAccess;
    },
    sameAccess(accessEditDocuments) {
      // Return the access level if all docs have the same access
      // Otherwise, return null
      let access = null;
      for (let i = 0; i < accessEditDocuments.length; i++) {
        const doc = accessEditDocuments[i];
        if (access == null) {
          access = doc.access;
        } else if (doc.access != access) {
          return null;
        }
      }
      return access;
    }
  }
});

export function unselectDocument(document) {
  const { [document.id]: _, ...everythingElse } = layout.selectedMap;
  layout.selectedMap = everythingElse;
}

// Dialogs
export function hideRename() {
  layout.renameOpen = false;
}

export function openAccess(documents) {
  layout.accessEditDocuments = documents;
}

export function hideAccess() {
  layout.accessEditDocuments = [];
}
