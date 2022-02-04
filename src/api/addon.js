/**
 * Methods related to the DocumentCloud note API
 */

import session from "./session";
import { Addon } from "@/structure/addon";
import { apiUrl } from "./base";
import { injectMe } from "@/util/data";
import { queryBuilder } from "@/util/url";
import { grabAllPages } from "@/util/paginate";
import { DEFAULT_EXPAND } from "./common";

// export async function createAnnotation(
//   id,
//   page_number,
//   title,
//   content,
//   access,
//   x1,
//   x2,
//   y1,
//   y2,
//   me,
// ) {
//   // Create an annotation
//   const { data } = await session.post(apiUrl(`documents/${id}/notes/`), {
//     page_number,
//     title,
//     content,
//     x1,
//     x2,
//     y1,
//     y2,
//     access,
//   });
//   return new Note(injectMe(data, me));
// }

// export async function updateAnnotation(
//   noteId,
//   docId,
//   page_number,
//   title,
//   content,
//   access,
//   x1,
//   x2,
//   y1,
//   y2,
//   me,
// ) {
//   // Update an annotation
//   const { data } = await session.put(
//     apiUrl(`documents/${docId}/notes/${noteId}/`),
//     {
//       page_number,
//       title,
//       content,
//       x1,
//       x2,
//       y1,
//       y2,
//       access,
//     },
//   );
//   return new Note(injectMe(data, me));
// }

// export async function getAnnotations(id, expand = DEFAULT_EXPAND) {
//   // Returns annotations for the specified document
//   const results = await grabAllPages(
//     apiUrl(queryBuilder(`documents/${id}/notes/`, { expand })),
//   );
//   return results.map((result) => new Note(result));
// }

// export async function getAnnotationsPage(id, expand = DEFAULT_EXPAND, page) {
//   // Returns annotations for the specified document at the specified page
//   const results = await grabAllPages(
//     apiUrl(
//       queryBuilder(`documents/${id}/notes/`, { expand, page_number: page }),
//     ),
//   );
//   return results.map((result) => new Note(result));
// }

// export async function getAnnotation(docId, noteId) {
//   // Get the note with the specified id
//   const { data } = await session.get(
//     apiUrl(`documents/${docId}/notes/${noteId}/`),
//   );
//   return new Note(data);
// }

// export async function getAddons() {
//   // Get the note with the specified id
//   const { data } = await session.get(
//     apiUrl(`plugins`),
//   );
//   return ;
// }

export async function getAddons(id, expand = DEFAULT_EXPAND, page) {
  // Returns addons for the specified document at the specified page
  const results = await grabAllPages(
    apiUrl(
      queryBuilder(`plugins`, { expand, page_number: page }),
    ),
  );
  return results.map((result) => new Addon(result));
}

export async function getAddon(addonId) {
  // Get the note with the specified id
  const { data } = await session.get(
    apiUrl(`plugins/${addonId}/`),
  );
  return new Addon(data);
}

// export async function editMetadata(ids, metadata) {
//   // Edit the published url of the documents with the specified ids
//   await session.patch(
//     apiUrl(`documents/`),
//     ids.map((id) => ({ ...metadata, id })),
//   );
// }


export async function postAddonDispatch(addonId, addonParameters, ids) {
  // Dispatch the addon for the specified document ids with the parameters fulfilled by the user
  await session.post(
    apiUrl(`plugins/${addonId}/dispatch/`), {
    parameters: addonParameters,
    documents: ids.map((id) =>  parseInt(id.id,10) )
  }
  );

}

// export async function deleteAnnotation(docId, noteId) {
//   // Delete the note with the specified id
//   await session.delete(apiUrl(`documents/${docId}/notes/${noteId}/`));
// }
