import { Svue } from "svue";
import {
  getDocumentsWithIds,
  getPendingProgress,
  deleteDocument,
  reprocessDocument,
  cancelProcessing,
  changeAccess,
  editMetadata,
  addData,
  removeData,
} from "@/api/document";
import {
  addDocumentsToProject,
  removeDocumentsFromProject,
} from "@/api/project";
import { layout, hideAccess } from "./layout";
import { wrapLoad, wrapSeparate } from "@/util/wrapLoad";
import { showConfirm } from "./confirmDialog";
import { router } from "@/router/router";
import { search, handleUpload, setDocuments } from "@/search/search";
import { pushToast } from "./toast";
import { handlePlural } from "@/util/string";
import { removeFromArray, addToArrayIfUnique } from "@/util/array";
import { modifications } from './modifications';
import { docEquals, copyDoc } from '@/structure/document';
import { batchDelay } from '@/util/batchDelay';

const GET_BATCH = parseInt(process.env.GET_BATCH);
const GET_BATCH_DELAY = parseInt(process.env.GET_BATCH_DELAY);

// Only show up to this many documents, regardless of how many are uploaded
const MAX_DISPLAY = 50;

let lastSelected = null;
const PROCESSING_CHANGE_TIMEOUT = 500;

function mapReduce(l, id, fn) {
  const results = {};
  for (let i = 0; i < l.length; i++) {
    const x = l[i];
    results[x[id]] = fn(x);
  }
  return results;
}

const PENDING_DOC_ID = 'doc_id';

export const documents = new Svue({
  data() {
    return {
      router,
      search,
      hasInited: false,
      processingChangeTimeout: null,
      doneProcessing: true,
      pending: [],
    };
  },
  watch: {
    "router.resolvedRoute"() {
      const route = router.resolvedRoute;
      unselectAll();
      if (route != null && (route.name == "app" || route.name == 'project')) {
        if (!this.hasInited) {
          initDocuments();
          this.hasInited = true;
        }
      }
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
    allDocuments(search) {
      return search.documents;
    },
    error(search) {
      return search.error;
    },
    docsById(allDocuments) {
      const results = {};
      allDocuments.forEach(doc => results[doc.id] = doc);
      return results;
    },
    documents(allDocuments) {
      // Show all documents
      return allDocuments;
    },
    pendingExisting(docsById, pending) {
      return pending.filter(x => {
        const id = x.doc_id;
        return docsById[id] != null;
      });
    },
    pendingMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, x => x);
    },
    imagesProcessedMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, x => {
        if (x.images == null || x.pages == null) return null;
        return x.pages - x.images;
      });
    },
    textsProcessedMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, x => {
        if (x.texts == null || x.pages == null) return null;
        return x.pages - x.texts;
      });
    },
    pageCountMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, x => {
        if (x.pages == null) return null;
        return x.pages;
      });
    },
    realProgressMap(pending) {
      return mapReduce(pending, PENDING_DOC_ID, x => {
        if (x.images == null || x.texts == null || x.pages == null) return null;
        const images = x.pages - x.images;
        const texts = x.pages - x.texts;
        return ((images + texts) / 2) / x.pages;
      });
    },
    processingDocuments(allDocuments) {
      return getDocumentsByCondition(
        (doc) => doc.pending,
        allDocuments
      );
    },
    updatingDocuments(documents) {
      return getDocumentsByCondition(
        (doc) => doc.readable,
        documents
      );
    },
    numProcessing(pendingExisting) {
      return pendingExisting.length;
    },
    rawDoneProcessing(numProcessing) {
      // Wait a second before modulating value
      return numProcessing == 0;
    },

    processingProgress(pendingExisting) {
      if (pendingExisting.length == 0) return 1;

      // Operate on documents with non-null progresses
      let totalPages = 0;
      let totalImagesProcessed = 0;
      let totalTextsProcessed = 0;
      for (let i = 0; i < pendingExisting.length; i++) {
        const p = pendingExisting[i];
        if (p.images != null && p.texts != null && p.pages != null) {
          totalPages += p.pages;
          totalImagesProcessed += p.pages - p.images;
          totalTextsProcessed += p.pages - p.texts;
        }
      }
      if (totalPages == 0) return 0;
      const totalPagesProcessed = (totalImagesProcessed + totalTextsProcessed) / 2;
      return totalPagesProcessed / totalPages;
    },
    pollDocuments(processingDocuments, updatingDocuments) {
      return [...processingDocuments, ...updatingDocuments];
    },
    pollEvents(pollDocuments, processingDocuments, numProcessing) {
      const grabPending = (processingDocuments.length > 0 || numProcessing > 0) ? [
        async () => {
          try {
            await updatePending();
          } catch (e) {
            console.error("error fetching pending", e);
          }
        }
      ] : [];
      const pollEvent = pollDocuments.length > 0 ? [
        async () => {
          await batchDelay(pollDocuments, GET_BATCH, GET_BATCH_DELAY, async (docs) => {
            try {
              const newDocs = await getDocumentsWithIds(
                docs.map((doc) => doc.id)
              );
              newDocs.forEach((doc) => replaceInCollection(doc));
            } catch (e) {
              console.error("failed to get update info", docs);
            }
          });
        },
      ] : [];
      return grabPending.concat(pollEvent);
    },
  },
});

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

  const newDocuments = documents.allDocuments.filter(
    (doc) => doc.id != docId
  );
  setDocuments(newDocuments);

  // Refresh when you delete everything to pull new search
  if (newDocuments.length == 0 && process.env.NODE_ENV != 'test') window.location.reload();
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
    modifications.add(collectionModifiers, newDocs.map(x => copyDoc(x)));
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
    "Confirm delete",
    `Proceeding will permanently delete the ${documents.length == 1
      ? "selected document"
      : `${documents.length} selected documents`
    }. Do you wish to continue?`,
    "Delete",
    async () => {
      await wrapLoad(layout, async () => {
        await deleteDocument(documents.map((doc) => doc.id));
        documents.map((doc) => removeFromCollection(doc.id));
      });
      unselectAll();
    }
  );
}

export async function markAsDirty(docIds) {
  const dirtyDocs = await getDocumentsWithIds(docIds);
  dirtyDocs.map((doc) => replaceInCollection(doc));
}

export function reprocessDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "Confirm reprocess",
    `Proceeding will force the ${documents.length == 1
      ? "selected document"
      : `${documents.length} selected documents`
    } to reprocess page and image text. Do you wish to continue?`,
    "Reprocess",
    async () => {
      await wrapLoad(layout, async () => {
        const ids = documents.map((doc) => doc.id);
        await reprocessDocument(ids);
        await markAsDirty(ids);
      });
      unselectAll();
    }
  );
}

export function cancelProcessDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "Cancel processing",
    `Proceeding will force the ${documents.length == 1
      ? "selected document"
      : `${documents.length} selected documents`
    } to stop processing. After processing has been stopped, an error will show after which you can “Force Reprocess” or delete the ${documents.length == 1
      ? "document"
      : `documents`} using the Edit menu. Do you wish to continue?`,
    "Continue",
    async () => {
      await wrapLoad(layout, async () => {
        for (let i = 0; i < documents.length; i++) {
          const id = documents[i].id;
          await cancelProcessing(id);
        }
      });
      await markAsDirty(documents.map((doc) => doc.id));
      unselectAll();
    }
  );
}

export async function changeAccessForDocuments(documents, access, layout) {
  await wrapLoad(layout, async () => {
    await changeAccess(
      documents.map((doc) => doc.id),
      access
    );
    documents.forEach((doc) =>
      updateInCollection(doc, (d) => (d.doc = { ...d.doc, status: "readable" }))
    );
  });
  hideAccess();
}

export function removeDocument(document) {
  return removeDocuments([document]);
}

export async function editSelectedDocumentInfo(info, layout, selected, viewerUpdate = () => { }) {
  await wrapLoad(layout, async () => {
    await editMetadata(
      selected.map((doc) => doc.id),
      info
    );
    // Show changes in UI
    selected.forEach((doc) =>
      updateInCollection(doc, (d) => (d.doc = { ...d.doc, ...info }))
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
  newValue
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
  newDocs = newDocs.map(d => {
    d.doc = { ...d.doc, status: 'pending' };
    return d;
  });
  // Update pending to show 0 progress on everything
  for (let i = 0; i < newDocs.length; i++) {
    const doc = newDocs[i];
    // Only all if not already set
    if (documents.pendingMap[doc.id] == null) {
      documents.pending.push({
        doc_id: doc.id,
        images: 0,
        texts: 0,
        pages: 0,
      });
    }
  }
  // Update pending
  documents.pending = documents.pending;
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
  const pending = await wrapSeparate(null, layout, () => getPendingProgress());
  for (let i = 0; i < pending.length; i++) {
    const pendingDoc = pending[i];
    const existingDoc = documents.pendingMap[pendingDoc.doc_id];
    if (existingDoc != null) {
      pendingDoc.images = pendingDoc.images == null ? existingDoc.images : pendingDoc.images;
      pendingDoc.texts = pendingDoc.texts == null ? existingDoc.texts : pendingDoc.texts;
      pendingDoc.pages = pendingDoc.pages == null ? existingDoc.pages : pendingDoc.pages;
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

export async function addDocsToProject(project, documents, showToast = true) {
  documents = documents.filter((doc) => !doc.projectIds.includes(project.id));
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await addDocumentsToProject(
      project.id,
      documents.map((doc) => doc.id)
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) => (d.doc = { ...d.doc, projects: addToArrayIfUnique(d.projectIds, project.id) })
      )
    );
  });
  if (!layout.error && showToast) {
    pushToast(
      `Successfully added ${handlePlural(
        documents.length,
        "document",
        true
      )} to ${project.title}.`
    );
  }
}

export async function removeDocsFromProject(
  project,
  documents,
  showToast = true
) {
  documents = documents.filter((doc) => doc.projectIds.includes(project.id));
  if (documents.length == 0) return;
  await wrapLoad(layout, async () => {
    await removeDocumentsFromProject(
      project.id,
      documents.map((doc) => doc.id)
    );
    documents.forEach((doc) =>
      updateInCollection(
        doc,
        (d) =>
        (d.doc = {
          ...d.doc,
          projects: removeFromArray(d.projectIds, project.id),
        })
      )
    );
  });
  if (!layout.error && showToast) {
    pushToast(
      `Successfully removed ${handlePlural(
        documents.length,
        "document",
        true
      )} from project (${project.title}).`
    );
  }
}
