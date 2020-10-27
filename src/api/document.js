/**
 * Methods related to the DocumentCloud document API
 */

import session from "./session";
import { apiUrl } from "./base";
import { timeout } from "@/util/timeout";
import { queryBuilder } from "@/util/url";
import { DEFAULT_ORDERING, DEFAULT_EXPAND } from "./common";
import { grabAllPages } from "@/util/paginate";
import { Results } from "@/structure/results";
import { batchDelay } from "@/util/batchDelay";
import axios from "axios";

import { Document, transformHighlights } from "@/structure/document";

const POLL_TIMEOUT = process.env.POLL_TIMEOUT;

const UPLOAD_BATCH = parseInt(process.env.UPLOAD_BATCH);
const UPLOAD_BATCH_DELAY = parseInt(process.env.UPLOAD_BATCH_DELAY);

const HIGHLIGHT_START = process.env.HIGHLIGHT_START;
const HIGHLIGHT_END = process.env.HIGHLIGHT_END;

// Statuses
export const PENDING = "pending";

export async function getMe(expand = DEFAULT_EXPAND) {
  // Returns the currently logged in user
  const { data } = await session.get(
    queryBuilder(apiUrl("users/me/"), { expand })
  );
  return data;
}

export async function getDocuments(
  extraParams = {},
  ordering = DEFAULT_ORDERING,
  page = 0,
  expand = DEFAULT_EXPAND
) {
  // Return documents with the specified parameters
  const params = { ...extraParams, ordering, expand, page: page + 1 };
  const url = apiUrl(queryBuilder("documents/", params));
  const { data } = await session.get(url);
  data.results = data.results.map((document) => new Document(document));
  return new Results(url, data);
}

export async function searchDocuments(
  query,
  page = 0,
  expand = DEFAULT_EXPAND
) {
  // Return documents with the specified parameters
  const url = apiUrl(
    queryBuilder("documents/search/", { q: query, expand, page: page + 1 })
  );
  const { data } = await session.get(url);

  // Fill in document data with a subsequent API call
  const docIds = data.results.map((document) => document.id);
  const newDocuments = await getDocumentsWithIds(docIds);
  for (let i = 0; i < newDocuments.length; i++) {
    newDocuments[i].doc = {
      ...newDocuments[i].doc,
      highlights: data.results[i].highlights,
    };
    data.results[i] = newDocuments[i];
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
    apiUrl(queryBuilder(`documents/${id}/`, { expand }))
  );
  return new Document(data);
}

export async function getDocumentsWithIds(
  ids,
  remaining = false,
  expand = DEFAULT_EXPAND
) {
  if (ids.length == 0) return [];
  // Return documents with the specified ids
  const params = { expand, id__in: ids };
  if (remaining) params["remaining"] = true;
  const documents = await grabAllPages(
    apiUrl(queryBuilder("documents/", params))
  );
  const docs = documents.map((document) => new Document(document));
  const orderedDocs = [];
  for (let i = 0; i < ids.length; i++) {
    const matching = docs.filter((doc) => doc.id == ids[i]);
    if (matching.length == 0) continue;
    orderedDocs.push(matching[0]);
  }
  return orderedDocs;
}

export async function deleteDocument(ids) {
  // Delete the documents with the specified ids
  await session.delete(
    apiUrl(
      queryBuilder(`documents/`, {
        id__in: ids,
      })
    )
  );
}

export async function renameDocument(ids, title) {
  // Rename the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map((id) => ({ id, title }))
  );
}

export async function changeAccess(ids, access) {
  // Change access for the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map((id) => ({ id, access }))
  );
}

export async function reprocessDocument(ids) {
  // Reprocess the documents with the specified ids
  await session.post(
    apiUrl(`documents/process/`),
    ids.map((id) => ({ id }))
  );
}

export async function cancelProcessing(id) {
  // Cancel processing the document with the specified id
  const { data } = await session.delete(apiUrl(`documents/${id}/process`));
  return data;
}

export async function redactDocument(id, redactions) {
  // Redact the document with the specified id and redactions
  await session.post(
    apiUrl(`documents/${id}/redactions/`),
    redactions.map((redaction) => redaction.note)
  );
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
  conditionFn = (doc) => doc.nonPending
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
 * @param {boolean} forceOcr If true, OCRs regardless of embedded text
 * @param {Function} progressFn A function to call with upload progress
 * @param {Function} allCompleteFn A function to call when all docs upload
 * @param {Function} errorFn A function to call when an error occurs
 */
export async function uploadDocuments(
  docs,
  access,
  language,
  forceOcr,
  progressFn,
  allCompleteFn,
  errorFn
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

  // Allocate documents with the appropriate titles.
  let newDocuments;
  try {
    const data = await batchDelay(
      docs,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subDocs) => {
        const { data } = await session.post(
          apiUrl("documents/"),
          subDocs.map((doc) => ({ title: doc.name, access, language }))
        );
        return data;
      }
    );
    newDocuments = data;
  } catch (e) {
    console.error(e);
    return errorFn("failed to create the document", e);
  }

  // Upload all the files
  try {
    await Promise.all(
      docs.map((doc, i) => {
        const url = newDocuments[i].presigned_url;
        const file = doc.file;

        return axios.put(url, file, {
          headers: {
            "Content-Type": "application/pdf",
          },
          onUploadProgress: (progressEvent) => {
            // Handle upload progress
            const progress = progressEvent.loaded / progressEvent.total;
            progresses[i].progress = progress;
            progressFn(i, progress);
          },
        });
      })
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to upload the document", e);
  }

  // Once all the files have uploaded, begin processing.
  const ids = newDocuments.map((doc) => doc.id);
  try {
    await batchDelay(
      ids,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subIds) =>
        await session.post(
          apiUrl(`documents/process/`),
          subIds.map((id) => ({ id, force_ocr: forceOcr }))
        )
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to start processing the document", e);
  }

  // Handle document completion
  allCompleteFn(ids);
}
