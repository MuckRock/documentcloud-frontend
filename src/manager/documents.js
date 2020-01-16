import { Svue } from 'svue';
import { getDocuments, getDocument, deleteDocument, reprocessDocument, changeAccess, renameDocument, PENDING } from '@/api/document';
import { layout, unselectAll, hideAccess } from './layout';
import { wrapMultiple } from '@/util/wrapLoad';
import { showConfirm } from './confirmDialog';

export const documents = new Svue({
  data() {
    return {
      rawDocuments: {
        documents: [],
        processingDocuments: [],
      }
    }
  },
  computed: {
    documents(rawDocuments) {
      return rawDocuments.documents;
    },
    processingDocumentsRaw(rawDocuments) {
      return rawDocuments.processingDocuments;
    },
    allDocuments(documents, processingDocumentsRaw) {
      const processingExclusive = processingDocumentsRaw.filter(doc => !documentsInclude(documents, doc.id));
      return [...documents, ...processingExclusive];
    },
    processingDocuments(processingDocumentsRaw, documents) {
      const docsFromProcessing = processingDocumentsRaw.filter(doc => doc.pending);
      const docsFromPrimary = documents.filter(doc => doc.pending && !documentsInclude(docsFromProcessing, doc.id));
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
      pDocs.forEach(doc => sum += doc.realProgress);
      return sum / pDocs.length;
    },
    pollEvents(processingDocuments) {
      return processingDocuments.map(doc => {
        return async () => {
          const newDoc = await getDocument(doc.id);
          replaceInCollection(newDoc);
        }
      });
    }
  },
});

function documentsInclude(documents, id) {
  for (let i = 0; i < documents.length; i++) {
    if (documents[i].id == id) return true;
  }
  return false;
}

function removeFromCollection(document) {
  const newDocuments = documents.documents.filter(doc => doc.id != document.id);
  const newProcessingDocuments = documents.processingDocumentsRaw.filter(doc => doc.id != document.id);
  documents.rawDocuments = { documents: newDocuments, processingDocuments: newProcessingDocuments };
}

function updateInCollection(document, docFn) {
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

  documents.rawDocuments = { documents: newDocuments, processingDocuments: newProcessingDocuments };
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
    `Proceeding will permanently delete the ${documents.length == 1 ? 'selected document' : `${documents.length} selected documents`}. Do you wish to continue?`,
    "Delete",
    async () => {
      await wrapMultiple(layout, ...documents.map(doc => async () => {
        await deleteDocument(doc.id);
        removeFromCollection(doc);
      }));
      unselectAll();
    }
  );
}

export function reprocessDocuments(documents) {
  if (documents.length == 0) return;
  showConfirm(
    "Confirm reprocess",
    `Proceeding will force the ${documents.length == 1 ? 'selected document' : `${documents.length} selected documents`} to reprocess page and image text. Do you wish to continue?`,
    "Reprocess",
    async () => {
      await wrapMultiple(layout, ...documents.map(doc => async () => {
        await reprocessDocument(doc.id);
        const reprocessingDoc = await getDocument(doc.id);
        replaceInCollection(reprocessingDoc);
      }));
      unselectAll();
    }
  );
}

export async function changeAccessForDocuments(access) {
  await wrapMultiple(layout, ...layout.accessEditDocuments.map(doc => async () => {
    await changeAccess(doc.id, access);
    updateInCollection(doc, doc => doc.doc = { ...doc.doc, access });
  }));
  hideAccess();
}

export function removeDocument(document) {
  return removeDocuments([document]);
}

export async function renameSelectedDocuments(title) {
  await wrapMultiple(layout, ...layout.selected.map(doc => async () => {
    await renameDocument(doc.id, title);
    // Show changes in UI
    updateInCollection(doc, doc => doc.doc = { ...doc.doc, title });
  }));
  unselectAll();
}

export async function handleNewDocument(id) {
  const newDoc = await getDocument(id);
  if (documentsInclude(documents.allDocuments, newDoc)) {
    replaceInCollection(newDoc);
  } else {
    documents.rawDocuments = { ...documents.rawDocuments, documents: [newDoc, ...documents.rawDocuments.documents] };
  }
}

async function init() {
  const [newDocuments, newProcessingDocuments] = await wrapMultiple(layout, () => getDocuments(), () => getDocuments(PENDING));
  documents.rawDocuments = { documents: newDocuments, processingDocuments: newProcessingDocuments };
}

init();
