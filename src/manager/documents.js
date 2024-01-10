import { Svue } from "svue";

import {
  getDocumentsWithIds,
  getPendingProgress,
  deleteDocument,
  reprocessDocument,
  cancelProcessing,
  editMetadata,
  addData,
  removeData,
  changeRevisionControl,
} from "../api/document.js";
import {
  addDocumentsToProject,
  removeDocumentsFromProject,
} from "../api/project.js";
import { layout, hideAccess, hideRevisions } from "./layout.js";
import { wrapLoad, wrapSeparate } from "@/util/wrapLoad.js";
import { showConfirm } from "./confirmDialog.js";
import { router } from "@/router/router.js";
import { search, handleUpload, setDocuments } from "@/search/search.js";
import { removeFromArray, addToArrayIfUnique } from "@/util/array.js";
import { modifications } from "./modifications.js";
import { docEquals, copyDoc } from "@/structure/document.js";
import { truthyParamValue } from "@/util/url.js";

// Only show up to this many documents, regardless of how many are uploaded
const MAX_DISPLAY = 50;

let lastSelected = null;
const PROCESSING_CHANGE_TIMEOUT = 500;

function mapReduce(l, id, fn) {
  const results = {};
  if (!l || l.length === 0) {
    return results;
  }
  for (let i = 0; i < l.length; i++) {
    const x = l[i];
    results[x[id]] = fn(x);
  }
  return results;
}

const PENDING_DOC_ID = "doc_id";

export const documents = new Svue({
  data() {
    return {
      router,
      search,
      hasInited: false,
      processingChangeTimeout: null,
      doneProcessing: true,
      pending: [],
      inDocumentPickerDialog: false,
    };
  },
  watch: {
    "router.resolvedRoute"() {
      checkForInit();
    },
    inDocumentPickerDialog() {
      checkForInit();
    },
    rawDoneProcessing() {
      if (this.processingChangeTimeout != null) {
        clearTimeout(this.processingChangeTimeout);
        this.processingChangeTimeout = null;
      }
      this.processingChangeTimeout = setTimeout(() => {
        this.doneProcessing = this.rawDoneProcessing;
        this.processingChangeTimeout = null;
      }, PROCESSING_CHANGE_TIMEOUT);
    },
  },
  computed: {
    staticMode(router) {
      // Applies when in embed or dialog
      const route = router.resolvedRoute;
      if (route == null) return true;
      if (route.name == "project") return true; // project embeds are static
      if (route.props != null && truthyParamValue(route.props.embed))
        return true;
      return false;
    },
    allDocuments(search) {
      return search.documents.filter((doc) => !doc.deleted);
    },
    error(search) {
      return search.error;
    },
    docsById(allDocuments) {
      const results = {};
      allDocuments.forEach((doc) => (results[doc.id] = doc));
      return results;
    },
    documents(allDocuments) {
      // Show all documents
      return allDocuments;
    },
    pendingExisting(docsById, pending) {
      if (!pending) return [];
      return pending?.filter((x) => {
        const id = x.doc_id;
        return docsById[id] != null;
      });
    },
    pendingMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, (x) => x);
    },
    pagesProcessedMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, (x) => {
        if (
          x.images == null ||
          x.texts == null ||
          x.text_positions == null ||
          x.pages == null
        )
          return null;
        return Math.min(
          x.pages - x.images,
          x.pages - x.texts,
          x.pages - x.text_positions,
        );
      });
    },
    pageCountMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, (x) => {
        if (x.pages == null) return null;
        return x.pages;
      });
    },
    realProgressMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, (x) => {
        if (
          x.images == null ||
          x.texts == null ||
          x.text_positions == null ||
          x.pages == null
        )
          return null;
        const images = x.pages - x.images;
        const texts = x.pages - x.texts;
        const textPositions = x.pages - x.text_positions;
        return (images + texts + textPositions) / 3 / x.pages;
      });
    },
    processingDocuments(allDocuments) {
      return getDocumentsByCondition((doc) => doc.pending, allDocuments);
    },
    updatingDocuments(documents) {
      return getDocumentsByCondition((doc) => doc.readable, documents);
    },
    numProcessing(pending) {
      return (pending && pending.length) || 0;
    },
    rawDoneProcessing(numProcessing) {
      // Wait a second before modulating value
      return numProcessing == 0;
    },

    processingProgress(pending) {
      if (!pending || pending.length == 0) return 1;

      // Operate on documents with non-null progresses
      let totalPages = 0;
      let totalPagesProcessed = 0;
      for (let i = 0; i < pending.length; i++) {
        const p = pending[i];
        if (
          p.images != null &&
          p.texts != null &&
          p.text_positions != null &&
          p.pages != null
        ) {
          totalPages += p.pages;
          totalPagesProcessed +=
            (p.pages -
              p.images +
              (p.pages - p.texts) +
              (p.pages - p.text_positions)) /
            3;
        }
      }
      if (totalPages == 0) return 0;
      return totalPagesProcessed / totalPages;
    },
    pollDocuments(processingDocuments, updatingDocuments) {
      return [...processingDocuments, ...updatingDocuments];
    },
    pollEvents(pollDocuments, processingDocuments, numProcessing) {
      const grabPending =
        processingDocuments.length > 0 || numProcessing > 0
          ? [
              async () => {
                try {
                  await updatePending();
                } catch (e) {
                  console.error("error fetching pending", e);
                }
              },
            ]
          : [];
      const pollEvent =
        pollDocuments.length > 0
          ? [
              async () => {
                try {
                  const newDocs = await getDocumentsWithIds(
                    pollDocuments.map((doc) => doc.id),
                  );
                  newDocs.forEach((doc) => replaceInCollection(doc));
                } catch (e) {
                  console.error("failed to get update info", docs);
                }
              },
            ]
          : [];
      return grabPending.concat(pollEvent);
    },
  },
});

function checkForInit() {
  const route = router.resolvedRoute;
  if (
    route != null &&
    (documents.inDocumentPickerDialog ||
      route.name == "app" ||
      route.name == "project")
  ) {
    if (!documents.hasInited) {
      initDocuments();
      documents.hasInited = true;
    }
  }
}

function getDocumentsByCondition(condition, documents) {
  return documents.filter(condition);
}

function documentsInclude(documents, id) {
  for (let i = 0; i < documents.length; i++) {
    if (documents[i].id == id) return true;
  }
  return false;
}

const collectionModifiers = {
  addToCollection,
  removeFromCollection,
  updateInCollection,
};

export function removeFromCollection(docId, modify = true) {
  if (modify) {
    // Track the modifications
    modifications.remove(collectionModifiers, docId);
  }

  const newDocuments = documents.allDocuments.filter((doc) => doc.id != docId);
  setDocuments(newDocuments);
  // Remove from pending if applicable
  if (documents.pendingMap[docId] != null) {
    documents.pending = documents.pending.filter((x) => x.doc_id != docId);
  }

  // Refresh when you delete everything to pull new search
  if (newDocuments.length == 0 && process.env.NODE_ENV != "test")
    window.location.reload();
}

export function updateInCollection(document, docFn, modify = true) {
  let modified = false;
  let oldDoc = null;
  let newDoc = null;
  const newDocuments = documents.allDocuments.map((doc) => {
    if (doc.id == document.id) {
      oldDoc = copyDoc(doc);
      docFn(doc);
      modified = true;
      newDoc = copyDoc(doc);
    }
    return doc;
  });

  if (modify && modified) {
    // Track the modifications
    if (!docEquals(oldDoc, newDoc)) {
      // Only track modifications if an actual update occurs
      modifications.modify(collectionModifiers, oldDoc, docFn);
    }
  } else {
    // Modify to get the new doc, but don't set modified
    oldDoc = copyDoc(document);
    docFn(document);
    newDoc = copyDoc(document);
  }

  setDocuments(newDocuments);
  return [modified, newDoc];
}

function replaceInCollection(document) {
  updateInCollection(document, (doc) => {
    doc.doc = document.doc;
  });
}

function addToCollection(newDocs, modify = true) {
  // Make sure more than the max display docs aren't added
  const docsToAdd = Math.max(MAX_DISPLAY - documents.allDocuments.length, 0);
  newDocs = newDocs.slice(0, docsToAdd);

  if (modify) {
    // Track the modifications
    modifications.add(
      collectionModifiers,
      newDocs.map((x) => copyDoc(x)),
    );
  }

  const remainingDocs = [];
  newDocs.forEach((newDoc) => {
    if (documentsInclude(documents.allDocuments, newDoc.id)) {
      replaceInCollection(newDoc);
    } else {
      remainingDocs.push(newDoc);
    }
  });

  handleUpload(remainingDocs);
}

export function getIndex(document) {
  for (let i = 0; i < documents.documents.length; i++) {
    if (documents.documents[i] == document) return i;
  }
  return null;
}

export function removeDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "dialogDeleteDialog.title",
    "dialogDeleteDialog.deleteDocs",
    "dialog.delete",
    async () => {
      await wrapLoad(layout, async () => {
        await deleteDocument(documents.map((doc) => doc.id));
        documents.map((doc) => removeFromCollection(doc.id));
      });
      unselectAll();
    },
    { n: documents.length },
  );
}

export async function markAsDirty(docIds) {
  try {
    const dirtyDocs = await getDocumentsWithIds(docIds);
    dirtyDocs.map((doc) => replaceInCollection(doc));
  } catch (e) {
    console.error("unexpected error marking docs dirty", docIds);
  }
}

export async function reprocessDocuments(
  documents,
  forceOcr,
  ocrEngine,
  language,
) {
  await wrapLoad(layout, async () => {
    const ids = documents.map((doc) => doc.id);
    await editMetadata(
      documents.map((doc) => doc.id),
      { language },
    );
    await reprocessDocument(ids, forceOcr, ocrEngine);
    await markAsDirty(ids);
  });
}

export function cancelProcessDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "dialogCancelProcessingDialog.title",
    "dialogCancelProcessingDialog.deleteDocs",
    "dialog.continue",
    async () => {
      await wrapLoad(layout, async () => {
        for (let i = 0; i < documents.length; i++) {
          const id = documents[i].id;
          await cancelProcessing(id);
        }
      });
      await markAsDirty(documents.map((doc) => doc.id));
      unselectAll();
    },
    {
      n: documents.length,
    },
  );
}
export async function changeAccessForDocuments(
  documents,
  access,
  publishAt,
  layout,
  noindex,
) {
  await wrapLoad(layout, async () => {
    await editMetadata(
      documents.map((doc) => doc.id),
      { access, publish_at: publishAt, noindex },
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) =>
          (d.doc = {
            ...d.doc,
            status: "readable",
            publish_at: publishAt,
            noindex,
          }),
      ),
    );
  });
  hideAccess();
}

export async function changeRevisionControlForDocument(
  document,
  revision_control,
) {
  await wrapLoad(layout, async () => {
    await changeRevisionControl(
      document.id,
      revision_control,
    );
    updateInCollection(document, (d) => {
      d.doc = {
        ...d.doc,
        revision_control,
      };
    });
  });
  hideRevisions();
}

export async function changeOwnerForDocuments(
  documents,
  user,
  organization,
  layout,
) {
  await wrapLoad(layout, async () => {
    await editMetadata(
      documents.map((doc) => doc.id),
      { user: user.id, organization: organization.id },
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) => (d.doc = { ...d.doc, user, organization }),
      ),
    );
  });
}

export function removeDocument(document) {
  return removeDocuments([document]);
}

export async function editSelectedDocumentInfo(
  info,
  layout,
  selected,
  viewerUpdate = () => {},
) {
  await wrapLoad(layout, async () => {
    await editMetadata(
      selected.map((doc) => doc.id),
      info,
    );
    // Show changes in UI
    selected.forEach((doc) =>
      updateInCollection(doc, (d) => (d.doc = { ...d.doc, ...info })),
    );
    viewerUpdate();
  });
  unselectAll();
}

export async function addDocumentData(documents, key, value) {
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    // TODO: replace with bulk method
    await addData(document.id, key, value);

    if (document.doc.data[key] == null) {
      document.doc.data[key] = [value];
    } else {
      document.doc.data[key].push(value);
    }
    // Trigger document data update
    document.doc = document.doc;
    replaceInCollection(document);
  }
}

export async function replaceDocumentData(
  documents,
  originalKey,
  originalValue,
  newKey,
  newValue,
) {
  // TODO: potentially optimize with partial add-remove hybrid on matching keys
  await removeDocumentData(documents, originalKey, originalValue);
  await addDocumentData(documents, newKey, newValue);
}

export async function removeDocumentData(documents, key, value) {
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    // TODO: replace with bulk method
    await removeData(document.id, key, value);

    if (document.doc.data[key] != null) {
      // Only remove data from documents with data
      document.doc.data[key] = document.doc.data[key].filter((x) => x != value);
      document.doc = document.doc;
      replaceInCollection(document);
    }
  }
}

export async function handleNewDocuments(newDocs) {
  // Set status to pending to indicate progress
  newDocs = newDocs.map((d) => {
    d.doc = { ...d.doc, status: "pending" };
    return d;
  });
  addToCollection(newDocs);
}

export function selectDocument(document, shiftKey = true) {
  layout.selectedMap = { ...layout.selectedMap, [document.id]: document };
  if (shiftKey && lastSelected != null) {
    // Handle shift key for multiple selection
    const lastSelectedIndex = getIndex(lastSelected);
    if (lastSelectedIndex != null) {
      const toIndex = getIndex(document);
      if (toIndex != null) {
        for (
          let i = Math.min(lastSelectedIndex, toIndex) + 1;
          i < Math.max(lastSelectedIndex, toIndex);
          i++
        ) {
          selectDocument(documents.documents[i], false);
        }
      }
    }
  }
  lastSelected = document;
}

export function unselectAll() {
  layout.selectedMap = {};
  lastSelected = null;
}

async function updatePending() {
  if (documents.staticMode) return;

  const pending = await wrapSeparate(null, layout, () => getPendingProgress());
  for (let i = 0; i < (pending || []).length; i++) {
    const pendingDoc = pending[i];
    const existingDoc = documents.pendingMap[pendingDoc.doc_id];
    if (existingDoc != null) {
      pendingDoc.images =
        pendingDoc.images == null ? existingDoc.images : pendingDoc.images;
      pendingDoc.texts =
        pendingDoc.texts == null ? existingDoc.texts : pendingDoc.texts;
      pendingDoc.text_positions =
        pendingDoc.text_positions == null
          ? existingDoc.text_positions
          : pendingDoc.text_positions;
      pendingDoc.pages =
        pendingDoc.pages == null ? existingDoc.pages : pendingDoc.pages;
    }
  }
  documents.pending = pending;
}

export async function initDocuments() {
  // Set documents to search documents
  setDocuments([...search.documents]);

  // Grab pending information
  updatePending();
}

export async function addDocsToProject(project, documents) {
  documents = documents.filter((doc) => !doc.projectIds.includes(project.id));
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await addDocumentsToProject(
      project.id,
      documents.map((doc) => doc.id),
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) =>
          (d.doc = {
            ...d.doc,
            projects: addToArrayIfUnique(d.projectIds, project.id),
          }),
      ),
    );
  });
}

export async function removeDocsFromProject(project, documents) {
  documents = documents.filter((doc) => doc.projectIds.includes(project.id));
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await removeDocumentsFromProject(
      project.id,
      documents.map((doc) => doc.id),
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) =>
          (d.doc = {
            ...d.doc,
            projects: removeFromArray(d.projectIds, project.id),
          }),
      ),
    );
  });
}
