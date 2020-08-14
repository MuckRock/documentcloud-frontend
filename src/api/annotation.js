/**
 * Methods related to the DocumentCloud note API
 */

import session from "./session";
import { Note } from "@/structure/note";
import { apiUrl } from "./base";
import { injectMe } from "@/util/data";
import { queryBuilder } from "@/util/url";
import { grabAllPages } from "@/util/paginate";
import { DEFAULT_EXPAND } from "./common";

export async function createAnnotation(
  id,
  page_number,
  title,
  content,
  access,
  x1,
  x2,
  y1,
  y2,
  me
) {
  // Create an annotation
  const { data } = await session.post(apiUrl(`documents/${id}/notes/`), {
    page_number,
    title,
    content,
    x1,
    x2,
    y1,
    y2,
    access
  });
  return new Note(injectMe(data, me));
}

export async function updateAnnotation(
  noteId,
  docId,
  page_number,
  title,
  content,
  access,
  x1,
  x2,
  y1,
  y2,
  me
) {
  // Update an annotation
  const { data } = await session.put(
    apiUrl(`documents/${docId}/notes/${noteId}/`),
    {
      page_number,
      title,
      content,
      x1,
      x2,
      y1,
      y2,
      access
    }
  );
  return new Note(injectMe(data, me));
}

export async function getAnnotations(id, expand = DEFAULT_EXPAND) {
  // Returns annotations for the specified document
  const results = await grabAllPages(
    apiUrl(queryBuilder(`documents/${id}/notes/`, { expand }))
  );
  return results.map(result => new Note(result));
}

export async function getAnnotationsPage(id, expand = DEFAULT_EXPAND, page) {
  const { data } = await session.get(apiUrl(queryBuilder(`documents/${id}/notes/`, { expand, page_number: page })));
  return data;
}

export async function deleteAnnotation(docId, noteId) {
  // Delete the note with the specified id
  await session.delete(apiUrl(`documents/${docId}/notes/${noteId}/`));
}
