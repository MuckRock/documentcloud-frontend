/**
 * Methods related to the DocumentCloud document API
 */

import session from "./session";
import { apiUrl } from "./base";
import { timeout } from "@/util/timeout";
import { queryBuilder } from "@/util/url";
import { DEFAULT_ORDERING, DEFAULT_EXPAND } from "./common";
import { grabAllPages } from "@/util/paginate";
import axios from "axios";

import { Document } from "@/structure/document";

const POLL_TIMEOUT = process.env.POLL_TIMEOUT;

// Statuses
export const PENDING = 2;

export async function getMe(expand = DEFAULT_EXPAND) {
  // Returns the currently logged in user
  const { data } = await session.get(
    queryBuilder(apiUrl("users/me/"), { expand })
  );
  return data;
}

export async function getDocuments(
  status = null,
  ordering = DEFAULT_ORDERING,
  expand = DEFAULT_EXPAND
) {
  // Return documents with the specified parameters
  const { data } = await session.get(
    apiUrl(queryBuilder("documents/", { ordering, expand, status }))
  );
  const documents = data.results;
  return documents.map(document => new Document(document));
}

export async function getDocument(id, expand = DEFAULT_EXPAND) {
  // Get a single document with the specified id
  const { data } = await session.get(
    apiUrl(queryBuilder(`documents/${id}/`, { expand }))
  );
  return new Document(data);
}

export async function getDocumentsWithIds(ids, expand = DEFAULT_EXPAND) {
  // Return documents with the specified ids
  const documents = await grabAllPages(
    apiUrl(queryBuilder("documents/", { expand, id__in: ids }))
  );
  return documents.map(document => new Document(document));
}

export async function deleteDocument(ids) {
  // Delete the documents with the specified ids
  await session.delete(
    apiUrl(
      queryBuilder(`documents/`, {
        id__in: ids
      })
    )
  );
}

export async function renameDocument(ids, title) {
  // Rename the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map(id => ({ id, title }))
  );
}

export async function changeAccess(ids, access) {
  // Change access for the documents with the specified ids
  await session.patch(
    apiUrl(`documents/`),
    ids.map(id => ({ id, access }))
  );
}

export async function reprocessDocument(ids) {
  // Reprocess the documents with the specified ids
  await session.post(apiUrl(`documents/process/`), { ids });
}

export async function cancelProcessing(id) {
  // Cancel processing the document with the specified id
  const { data } = await session.delete(apiUrl(`documents/${id}/process`));
  return data;
}

export async function redactDocument(id, redactions) {
  // Redact the document with the specified id and redactions
  await session.post(apiUrl(`documents/${id}/redactions/`), redactions);
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
  conditionFn = doc => doc.nonPending
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
 * @param {Function} progressFn A function to call with upload progress
 * @param {Function} completeFn A function to call when an individual doc uploads
 * @param {Function} allCompleteFn A function to call when all docs upload
 * @param {Function} errorFn A function to call when an error occurs
 */
export async function uploadDocuments(
  docs,
  progressFn,
  completeFn,
  allCompleteFn,
  errorFn
) {
  // Set initial progresses
  const progresses = [];
  const toComplete = [];
  for (let i = 0; i < docs.length; i++) {
    progresses.push({
      index: i,
      progress: 0,
      startTime: Date.now(),
      completeTime: null,
      interval: null
    });
    toComplete.push(i);
  }

  for (let i = 0; i < docs.length; i++) {
    const formData = new FormData();
    const file = docs[i].file;
    const name = docs[i].name;
    formData.append("file", file);
    formData.append("title", name);

    session
      .post(apiUrl("documents/"), {
        title: name
      })
      .then(
        response => {
          // Allocate a document with title.
          const responseData = response.data;
          const url = responseData.presigned_url;
          const id = responseData.id;

          axios
            .put(url, file, {
              headers: {
                "Content-Type": "application/pdf"
              },
              onUploadProgress: progressEvent => {
                // Handle upload progress
                const progress = progressEvent.loaded / progressEvent.total;
                progresses[i].progress = progress;
                progressFn(i, progress);
              }
            })
            .then(
              () => {
                // Upload completed. Post to start processing.
                session.post(apiUrl(`documents/${id}/process/`)).then(
                  () => {
                    // Handle complete upload
                    if (progresses[i].interval != null) {
                      // Clear existing fake timer.
                      clearTimeout(progresses[i].interval);
                      progresses[i].interval = null;
                    }
                    for (let j = 0; j < toComplete.length; j++) {
                      if (toComplete[j] == i) {
                        toComplete.splice(j, 1);
                        completeFn(id, i);
                        break;
                      }
                    }
                    if (toComplete.length == 0) {
                      allCompleteFn();
                    }
                  },
                  e => {
                    errorFn("failed to start processing the document", e);
                  }
                );
              },
              e => {
                errorFn("failed to upload the document", e);
              }
            );
        },
        e => {
          errorFn("failed to create the document", e);
        }
      );
  }
}
