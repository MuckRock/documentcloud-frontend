import { Svue } from "svue";
import { router } from "@/router/router";
import { truthyParamValue } from '@/util/url';

// Used to calculate the most restricted level of access
// in a group of documents
const ACCESS_LEVELS = {
  public: 2,
  organization: 1,
  private: 0,
};

export const layout = new Svue({
  data() {
    return {
      router,
      sidebarExpanded: false,
      loading: true,
      error: false,
      // Whether upload dialog should be shown
      uploading: false,
      // Whether a doc is checked or not
      selectedMap: {},

      // Custom dialogs
      metaOpen: null,
      documentInfoOpen: false,
      projectEdit: null,
      projectOpen: false,
      projectEmbed: false,
      projectCollaboratorsOpen: false,
      projectEditUser: null,
      searchTipsOpen: false,
      diagnosticsOpen: false,

      // Data
      dataDocuments: [],
      dataOpen: false,

      // Which documents the access is being edited for
      accessEditDocuments: [],
    };
  },
  watch: {
    "router.resolvedRoute"() {
      this.sidebarExpanded = false;
    },
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
    selectionEditable(selected) {
      return selected.filter((doc) => !doc.editAccess).length == 0;
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
    sameAccess(sameProp) {
      // Return the access level if all docs have the same access
      // Otherwise, return null
      return sameProp("access");
    },
    samePublishAt(sameProp) {
      // Return the publish at date if all docs have the same publish at date
      // Otherwise, return null
      return sameProp("publishAt");
    },
    sameProp(accessEditDocuments) {
      // Return the given property if all docs have the same value for that property
      // Otherwise, return null
      return function (prop) {
        let value = null;
        for (let i = 0; i < accessEditDocuments.length; i++) {
          const doc = accessEditDocuments[i];
          if (i == 0) {
            value = doc[prop];
          } else if (doc[prop] != value) {
            return null;
          }
        }
        return value;
      };
    },
    projectCollaboratorAccessOpen(projectEditUser) {
      return projectEditUser != null;
    },

    // Project embed settings
    projectEmbedTitle(router) {
      const route = router.resolvedRoute;
      if (route == null) return null;
      if (route.name != 'project') return null;
      if (route.props == null) return null;
      return route.props.title;
    },
    projectEmbedSearchBar(router) {
      const route = router.resolvedRoute;
      if (route == null) return true;
      if (route.name != 'project') return true;
      if (route.props == null) return true;
      return truthyParamValue(route.props.searchbar);
    },
  },
});

export function selectionProcessing() {
  return [someProcessing(...layout.selected), allProcessing(...layout.selected)];
}

export function unselectDocument(document) {
  delete layout.selectedMap[document.id];
  layout.selectedMap = layout.selectedMap;
}

// Dialogs
export function hideDocumentInfo() {
  layout.documentInfoOpen = false;
}

export function hideMeta() {
  layout.metaOpen = null;
}

function canEdit(...documents) {
  return documents.filter((doc) => !doc.editAccess).length == 0;
}

function someProcessing(...documents) {
  return documents.filter((doc) => doc.processing).length > 0;
}

function allProcessing(...documents) {
  return documents.filter((doc) => !doc.processing).length == 0;
}

export function openAccess(documents) {
  if (
    documents.length == 0 ||
    !canEdit(...documents) ||
    someProcessing(...documents)
  )
    return;
  layout.accessEditDocuments = documents;
}

export function hideAccess() {
  layout.accessEditDocuments = [];
}

export function editData(documents) {
  if (documents.length == 0 || !canEdit(...documents)) return;

  layout.dataDocuments = documents;
  layout.dataOpen = true;
}

export function hideData() {
  layout.dataOpen = false;
}

export function newProject() {
  layout.projectEdit = null;
  layout.projectOpen = true;
}

export function embedProject() {
  hideProject();
  layout.projectEmbed = true;
}

export function hideProjectEmbed() {
  layout.projectEmbed = false;
}

export function editProject(project) {
  if (!project.editAccess) return;
  layout.projectEdit = project;
  layout.projectOpen = true;
}

export function hideProject() {
  layout.projectOpen = false;
}

export function showCollaborators() {
  layout.projectCollaboratorsOpen = true;
  layout.projectOpen = false;
}

export function hideCollaborators() {
  layout.projectCollaboratorsOpen = false;
}

export function updateProjectEdit() {
  layout.projectEdit = layout.projectEdit;
}

export function editProjectCollaboratorAccess(collaborator) {
  layout.projectEditUser = collaborator;
}

export function hideProjectCollaboratorAccess() {
  layout.projectEditUser = null;
}

export function showSearchTips() {
  layout.searchTipsOpen = true;
}

export function hideSearchTips() {
  layout.searchTipsOpen = false;
}

export function hideDiagnostics() {
  layout.diagnosticsOpen = false;
}
