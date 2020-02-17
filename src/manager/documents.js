import { Svue } from "svue";
import {
  getDocuments,
  getDocumentsWithIds,
  deleteDocument,
  reprocessDocument,
  changeAccess,
  renameDocument,
  PENDING
} from "@/api/document";
import { layout, hideAccess } from "./layout";
import { wrapLoad, wrapSeparate } from "@/util/wrapLoad";
import { showConfirm } from "./confirmDialog";
import { router } from "@/router/router";
import { search, handleUpload, setDocuments } from "@/search/search";

export const documents = new Svue({
  data() {
    return {
      processingDocumentsRaw: [],
      router,
      search
    };
  },
  watch: {
    router() {
      const route = router.resolvedRoute;
      if (route != null && route.name == "app") {
        initDocuments();
      } else {
        this.processingDocumentsRaw = [];
      }
    }
  },
  computed: {
    documents(search) {
      return search.documents;
    },
    error(search) {
      return search.error;
    },
    allDocuments(documents, processingDocumentsRaw) {
      const processingExclusive = processingDocumentsRaw.filter(
        doc => !documentsInclude(documents, doc.id)
      );
      return [...documents, ...processingExclusive];
    },
    processingDocuments(processingDocumentsRaw, documents) {
      const docsFromProcessing = processingDocumentsRaw.filter(
        doc => doc.pending
      );
      const docsFromPrimary = documents.filter(
        doc => doc.pending && !documentsInclude(docsFromProcessing, doc.id)
      );
      return [...docsFromProcessing, ...docsFromPrimary];
    },
    numProcessing(processingDocuments) {
      return processingDocuments.length;
    },
    doneProcessing(processingDocuments) {
      return processingDocuments.length == 0;
    },
    processingProgress(processingDocuments) {
      if (processingDocuments.length == 0) return 1;

      // Operate on documents with non-null progresses
      const pDocs = processingDocuments.filter(d => d.realProgress != null);
      if (pDocs.length == 0) return null;
      let sum = 0;
      pDocs.forEach(doc => (sum += doc.realProgress));
      return sum / pDocs.length;
    },
    pollEvents(processingDocuments) {
      if (processingDocuments.length == 0) return [];
      return [
        async () => {
          const newDocs = await getDocumentsWithIds(
            processingDocuments.map(doc => doc.id),
            true
          );
          newDocs.forEach(doc => replaceInCollection(doc));
        }
      ];
    }
  }
});

function documentsInclude(documents, id) {
  for (let i = 0; i < documents.length; i++) {
    if (documents[i].id == id) return true;
  }
  return false;
}

function removeFromCollection(document) {
  const newDocuments = documents.documents.filter(doc => doc.id != document.id);
  const newProcessingDocuments = documents.processingDocumentsRaw.filter(
    doc => doc.id != document.id
  );
  documents.rawDocuments = {
    documents: newDocuments,
    processingDocuments: newProcessingDocuments
  };
}

export function updateInCollection(document, docFn) {
  const newDocuments = documents.documents.map(doc => {
    if (doc.id == document.id) {
      docFn(doc);
    }
    return doc;
  });
  const newProcessingDocuments = documents.processingDocumentsRaw.map(doc => {
    if (doc.id == document.id) {
      docFn(doc);
    }
    return doc;
  });

  documents.processingDocumentsRaw = newProcessingDocuments;
  setDocuments(newDocuments);
}

function replaceInCollection(document) {
  updateInCollection(document, doc => {
    doc.doc = document.doc;
  });
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
    `Proceeding will permanently delete the ${
      documents.length == 1
        ? "selected document"
        : `${documents.length} selected documents`
    }. Do you wish to continue?`,
    "Delete",
    async () => {
      await wrapLoad(layout, async () => {
        await deleteDocument(documents.map(doc => doc.id));
        documents.map(doc => removeFromCollection(doc));
      });
      unselectAll();
    }
  );
}

export function reprocessDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "Confirm reprocess",
    `Proceeding will force the ${
      documents.length == 1
        ? "selected document"
        : `${documents.length} selected documents`
    } to reprocess page and image text. Do you wish to continue?`,
    "Reprocess",
    async () => {
      await wrapLoad(layout, async () => {
        const ids = documents.map(doc => doc.id);
        await reprocessDocument(ids);
        const reprocessingDocs = await getDocumentsWithIds(ids, true);
        reprocessingDocs.map(doc => replaceInCollection(doc));
      });
      unselectAll();
    }
  );
}

export async function changeAccessForDocuments(documents, access) {
  await wrapLoad(layout, async () => {
    await changeAccess(
      documents.map(doc => doc.id),
      access
    );
    documents.forEach(doc =>
      updateInCollection(doc, d => (d.doc = { ...d.doc, access }))
    );
  });
  hideAccess();
}

export function removeDocument(document) {
  return removeDocuments([document]);
}

export async function renameSelectedDocuments(title) {
  await wrapLoad(layout, async () => {
    await renameDocument(
      layout.selected.map(doc => doc.id),
      title
    );
    // Show changes in UI
    layout.selected.forEach(doc =>
      updateInCollection(doc, d => (d.doc = { ...d.doc, title }))
    );
  });
  unselectAll();
}

export async function handleNewDocuments(ids) {
  const newDocs = await getDocumentsWithIds(ids, true);
  const remainingDocs = [];
  newDocs.forEach(newDoc => {
    if (documentsInclude(documents.allDocuments, newDoc)) {
      replaceInCollection(newDoc);
    } else {
      remainingDocs.push(newDoc);
    }
  });
  handleUpload(remainingDocs);
}

let lastSelected = null;

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

export async function initDocuments() {
  const results = await wrapSeparate(
    null,
    search,
    () => getDocuments(PENDING) // disregard pagination of processing docs (only show first 25)
  );
  documents.processingDocumentsRaw = results.results;
}
