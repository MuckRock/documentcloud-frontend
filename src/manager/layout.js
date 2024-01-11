import { Svue } from "svue";
import { router, setHash, setQS } from "@/router/router.js";
import { truthyParamValue } from "@/util/url.js";
import { sameProp } from "@/util/array.js";

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
      addonDispatchOpen: null,
      addonBrowserOpen: false,
      addonRunsOpen: false,
      metaOpen: null,
      documentInfoOpen: false,
      projectEdit: null,
      projectOpen: false,
      projectEmbed: false,
      projectCollaboratorsOpen: false,
      projectEditUser: null,
      searchTipsOpen: false,
      diagnosticsOpen: false,
      mailkeyOpen: false,
      viewDocumentRevisions: null,

      // nest any captured URL params here
      params: {
        addOnEvent: null,
      },

      // Data
      dataDocuments: [],
      dataOpen: false,

      // Which documents the access is being edited for.
      // Also used for editing hiding from indexing.
      accessEditDocuments: [],

      // Which documents are being reprocessed
      reprocessDocuments: [],

      // Which documents the owner is being edited for
      ownerEditDocuments: [],
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
    reprocessOpen(reprocessDocuments) {
      return reprocessDocuments.length > 0;
    },
    ownerOpen(ownerEditDocuments) {
      return ownerEditDocuments.length > 0;
    },
    numAccessSelected(accessEditDocuments) {
      return accessEditDocuments.length;
    },
    numReprocessSelected(reprocessDocuments) {
      return reprocessDocuments.length;
    },
    sameLanguage(reprocessDocuments) {
      return sameProp(reprocessDocuments, (x) => x["language"]);
    },
    numOwnerSelected(ownerEditDocuments) {
      return ownerEditDocuments.length;
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
    defaultNoindex(accessEditDocuments) {
      return accessEditDocuments.every((doc) => doc.noindex);
    },
    sameAccess(sameAccessProp) {
      // Return the access level if all docs have the same access
      // Otherwise, return null
      return sameAccessProp("access");
    },
    samePublishAt(sameAccessProp) {
      // Return the publish at date if all docs have the same publish at date
      // Otherwise, return null
      return sameAccessProp("publishAt");
    },
    sameNoindex(sameAccessProp) {
      // Return the given property if all docs have the same value for that property
      // Otherwise, return null
      return sameAccessProp("noindex");
    },
    sameAccessProp(accessEditDocuments) {
      // Return the given property if all docs have the same value for that property
      // Otherwise, return null
      return (prop) => sameProp(accessEditDocuments, (x) => x[prop]);
    },
    projectCollaboratorAccessOpen(projectEditUser) {
      return projectEditUser != null;
    },

    // Project embed settings
    projectEmbedTitle(router) {
      const route = router.resolvedRoute;
      if (route == null) return null;
      if (route.name != "project") return null;
      if (route.props == null) return null;
      return route.props.title;
    },
    projectEmbedSearchBar(router) {
      const route = router.resolvedRoute;
      if (route == null) return true;
      if (route.name != "project") return true;
      if (route.props == null) return true;
      return truthyParamValue(route.props.searchbar);
    },
  },
});

/*
 * TODO: Rethink the way layout works and all the exported functions here
 */

export function selectionProcessing() {
  return [
    someProcessing(...layout.selected),
    allProcessing(...layout.selected),
  ];
}

export function unselectDocument(document) {
  delete layout.selectedMap[document.id];
  layout.selectedMap = layout.selectedMap;
}

// Dialogs
export function openDispatchAddon(addon) {
  const { repository } = addon.addon;
  setHash(`add-ons/${repository}`);
}

export function showAddonEvent(addon, eventId) {
  const { repository } = addon.addon;
  setHash(`add-ons/${repository}/${eventId}`);
  layout.addonDispatchOpen = addon;
  layout.params.addOnEvent = eventId;
}

export function hideAddonDispatch() {
  setHash("");
  setQS(new URLSearchParams(), ["q"]); // clear query params
  layout.addonDispatchOpen = null;
  layout.params.addOnEvent = null;
}

export function openAddonBrowser() {
  setHash("add-ons");
  layout.addonBrowserOpen = true;
}

export function hideAddonBrowser() {
  setHash("");
  setQS(new URLSearchParams(), ["q"]); // clear query params
  layout.addonBrowserOpen = false;
  layout.params.addOnEvent = null;
}

export function showAddonRuns() {
  setHash("add-ons/runs");
  layout.addonRunsOpen = true;
}

export function hideAddonRuns() {
  setHash("");
  layout.addonRunsOpen = false;
}

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

export function openRevisions(document) {
  layout.viewDocumentRevisions = document;
}

export function hideRevisions() {
  layout.viewDocumentRevisions = null;
}

export function hideReprocess() {
  layout.reprocessDocuments = [];
}

export function hideOwner() {
  layout.ownerEditDocuments = [];
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

export function hideMailkey() {
  layout.mailkeyOpen = false;
}
