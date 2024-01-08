/**
 * Methods related to the DocumentCloud document API
 */

import session from "./session.js";
import { apiUrl } from "./base.js";
import { timeout } from "@/util/timeout.js";
import { queryBuilder } from "@/util/url.js";
import { DEFAULT_EXPAND } from "./common.js";
import { Results } from "@/structure/results.js";
import { batchDelay } from "@/util/batchDelay.js";
import { StorageManager } from "@/util/storageManager.js";
import { includes } from "@/util/array.js";
import axios from "axios";

import { Document, transformHighlights } from "@/structure/document.js";

const POLL_TIMEOUT = process.env.POLL_TIMEOUT;

const GET_BATCH = parseInt(process.env.GET_BATCH);
const GET_BATCH_DELAY = parseInt(process.env.GET_BATCH_DELAY);
const UPLOAD_BATCH = parseInt(process.env.UPLOAD_BATCH);
const UPLOAD_BATCH_DELAY = parseInt(process.env.UPLOAD_BATCH_DELAY);

const HIGHLIGHT_START = process.env.HIGHLIGHT_START;
const HIGHLIGHT_END = process.env.HIGHLIGHT_END;

// Statuses
export const PENDING = "pending";

// Manage deleted docs
const deletedManager = new StorageManager("deleted");

function addDeletedDocs(ids) {
  deletedManager.set("", deletedManager.get("", []).concat(ids));
}

function filterDeleted(docs) {
  const deleted = deletedManager.get("", []);
  return docs.filter((x) => !includes(deleted, x.id));
}

export async function searchDocuments(
  query,
  onlyShowSuccess,
  expand = DEFAULT_EXPAND,
) {
  // Return documents with the specified parameters
  const url = apiSearchUrl(query, onlyShowSuccess, expand);
  return searchDocumentsHelper(url);
}

export function apiSearchUrl(
  query,
  onlyShowSuccess = false,
  expand = DEFAULT_EXPAND,
) {
  let params = {
    q: query,
    expand,
    version: "2.0",
    hl: "true",
  };
  if (onlyShowSuccess) {
    params.status = "success";
  }
  return apiUrl(queryBuilder("documents/search/", params));
}

export async function searchDocumentsUrl(url) {
  return searchDocumentsHelper(url);
}

async function searchDocumentsHelper(url) {
  const { data } = await session.get(url);
  if (data.results?.length > 0 && data.results[0].hasOwnProperty("document")) {
    // if we are using the project API, the document is one level down
    data.results = filterDeleted(
      data.results.map((doc) => new Document(doc.document)),
    );
  } else {
    data.results = filterDeleted(data.results.map((doc) => new Document(doc)));
  }

  return new Results(url, data);
}

export async function searchDocument(query, docId) {
  // Return documents with the specified parameters
  const url = apiUrl(queryBuilder(`documents/${docId}/search/`, { q: query }));
  const { data } = await session.get(url);

  // Return search highlights in dictionary form
  return transformHighlights(data, HIGHLIGHT_START, HIGHLIGHT_END, true);
}

export async function getDocument(id, expand = DEFAULT_EXPAND) {
  // Get a single document with the specified id
  const { data } = await session.get(
    apiUrl(queryBuilder(`documents/${id}.json`, { expand })),
  );
  return new Document(data);
}

export async function getDocumentsWithIds(
  ids,
  remaining = false,
  expand = DEFAULT_EXPAND,
) {
  return await batchDelay(
    ids,
    GET_BATCH,
    GET_BATCH_DELAY,
    async (subIds) => {
      if (subIds?.length == 0) return [];
      // Return documents with the specified ids
      const params = { expand, id__in: subIds };
      if (remaining) params["remaining"] = true;
      const { data } = await session.get(
        apiUrl(queryBuilder("documents/", params)),
      );
      const docs = data.results.map((document) => new Document(document));
      const orderedDocs = [];
      for (let i = 0; i < subIds.length; i++) {
        const matching = docs.filter((doc) => doc.id == subIds[i]);
        if (matching.length == 0) continue;
        orderedDocs.push(matching[0]);
      }
      return orderedDocs;
    },
    (e) => console.error("error getting documents with ids", e),
  );
}

export async function deleteDocument(ids) {
  // Delete the documents with the specified ids
  await session.delete(
    apiUrl(
      queryBuilder(`documents/`, {
        id__in: ids,
      }),
    ),
  );
  addDeletedDocs(ids);
}

// "metadata" here includes access level, publish date, and noindex.
export async function editMetadata(ids, metadata) {
  // Edit the published url of the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map((id) => ({ ...metadata, id })),
  );
}

export async function changeAccess(ids, access) {
  // Change access for the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map((id) => ({ id, access })),
  );
}

export async function changeRevisionControl(ids, revision_control) {
  // Enable or disable revision control on specified documents
  const { data } = await session.patch(
    apiUrl(
      queryBuilder(`documents/`, {
        expand: [DEFAULT_EXPAND, "revisions"].join(","),
      }),
    ),
    ids.map((id) => ({
      id,
      revision_control,
    })),
  );
  return data;
}

export async function reprocessDocument(ids, forceOcr, ocrEngine) {
  // Reprocess the documents with the specified ids
  await session.post(
    apiUrl(`documents/process/`),
    ids.map((id) => ({ id: id, force_ocr: forceOcr, ocr_engine: ocrEngine })),
  );
}

export async function cancelProcessing(id) {
  // Cancel processing the document with the specified id
  const { data } = await session.delete(apiUrl(`documents/${id}/process/`));
  return data;
}

export async function getPendingProgress() {
  // Return all pending doc progress
  const { data } = await session.get(apiUrl(`documents/pending/`));
  return data;
}

export async function redactDocument(id, redactions) {
  // Redact the document with the specified id and redactions
  await session.post(
    apiUrl(`documents/${id}/redactions/`),
    redactions.map((redaction) => redaction.note),
  );
}

export async function modifyDocument(id, modifications) {
  // Apply the page modifications to the specified document id
  await session.post(apiUrl(`documents/${id}/modifications/`), modifications);
}

export async function addData(id, key, value) {
  // TODO: Url encode data key?
  await session.patch(apiUrl(`documents/${id}/data/${key}/`), {
    values: [value],
  });
}

export async function removeData(id, key, value) {
  // TODO: Url encode data key?
  await session.patch(apiUrl(`documents/${id}/data/${key}/`), {
    remove: [value],
  });
}

/**
 * Polls the specified document, repeatedly requesting it until the specified condition is met.
 * @param {string} id The document id to poll
 * @param {Function} docFn A function to run each time the document is retrieved
 * @param {Function} doneFn A function to run when polling stops
 * @param {Function} conditionFn A function to test each doc and stop polling if it returns true.
 *     Defaults to check if the doc is not pending.
 */
export async function pollDocument(
  id,
  docFn,
  doneFn,
  conditionFn = (doc) => doc.nonPending,
) {
  let doc;
  try {
    // Attempt to fetch the document
    doc = await getDocument(id);
  } catch (e) {
    // Doc was potentially deleted
    // TODO: Investigate whether should call done or add a deleteFn (or handle fn)
    return;
  }
  // Trigger the new document function
  if (docFn != null) docFn(doc);

  // Test for the document being finished
  if (conditionFn(doc)) {
    if (doneFn != null) doneFn(doc);
    return;
  }

  // Retrigger after timeout
  await timeout(POLL_TIMEOUT);
  pollDocument(id, docFn, doneFn, conditionFn);
}

/**
 * Uploads the specified documents, providing callbacks for progress updates
 * @param {Array<Document>} docs The documents to upload
 * @param {string} access The access level of the uploaded docs ("private", "organization", or "public")
 * @param {string} language The language code of the uploaded docs
 * @param {Array<Project>} projects Projects to upload the documents to
 * @param {boolean} forceOcr If true, OCRs regardless of embedded text
 * @param {string} ocrEngine Select OCR engine
 * @param {boolean} revision_control Toggles revision history on document
 * @param {Function} createProgressFn A function to call with process progress
 * @param {Function} progressFn A function to call with upload progress
 * @param {Function} processProgressFn A function to call with process progress
 * @param {Function} allCompleteFn A function to call when all docs upload
 * @param {Function} errorFn A function to call when an error occurs
 */
export async function uploadDocuments(
  docs,
  access,
  language,
  forceOcr,
  ocrEngine,
  revision_control,
  projects,
  createProgressFn,
  progressFn,
  processProgressFn,
  allCompleteFn,
  errorFn,
) {
  // Set initial progresses
  const progresses = [];
  const toComplete = [];
  for (let i = 0; i < docs.length; i++) {
    progresses.push({
      progress: 0,
    });
    toComplete.push(i);
  }

  const projectIds = projects.map((p) => p.id);

  // Allocate documents with the appropriate titles.
  let newDocuments;
  try {
    const getExtension = (file) => {
      if (file.name == null) return "";
      const parts = file.name.split(".");
      if (parts.length <= 1) return "";
      return parts[parts.length - 1].toLowerCase();
    };
    let createCount = 0;
    const data = await batchDelay(
      docs,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subDocs) => {
        const { data } = await session.post(
          apiUrl("documents/"),
          subDocs.map((doc) => ({
            title: doc.name,
            access,
            language,
            original_extension: getExtension(doc.file),
            projects: projectIds,
            revision_control,
          })),
        );
        createCount += subDocs.length;
        createProgressFn(createCount / docs.length);
        return data;
      },
      (e) => console.error("error creating some docs", e),
    );
    newDocuments = data;
  } catch (e) {
    console.error(e);
    return errorFn("failed to create the document", e);
  }

  // Upload all the files
  const badDocs = {};
  try {
    await Promise.all(
      docs.map((doc, i) => {
        const url = newDocuments[i].presigned_url;
        const id = newDocuments[i].id;
        const file = doc.file;

        return new Promise((resolve) => {
          axios
            .put(url, file, {
              headers: {
                "Content-Type": file.type || "application/octet-stream",
              },
              onUploadProgress: (progressEvent) => {
                // Handle upload progress
                const progress = progressEvent.loaded / progressEvent.total;
                progresses[i].progress = progress;
                progressFn(i, progress);
              },
            })
            .then((results) => resolve(results))
            .catch((e) => {
              // Handle error
              console.error("doc upload failed", e);
              // Update progress
              progresses[i].progress = 1;
              progressFn(i, 1);
              badDocs[id] = true;
              resolve();
            });
        });
      }),
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to upload the document", e);
  }

  // Once all the files have uploaded, begin processing.
  const goodDocuments = newDocuments.filter((doc) => !badDocs[doc.id]);
  const ids = goodDocuments.map((doc) => doc.id);
  let count = 0;
  try {
    await batchDelay(
      ids,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subIds) => {
        await session.post(
          apiUrl(`documents/process/`),
          subIds.map((id) => ({
            id,
            force_ocr: forceOcr,
            ocr_engine: ocrEngine,
          })),
        );
        count += subIds.length;
        processProgressFn(count / ids.length);
      },
      (e) => console.error("error processing some docs", e),
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to start processing the document", e);
  }

  // Handle document completion
  allCompleteFn(goodDocuments.map((x) => new Document(x)));
}
