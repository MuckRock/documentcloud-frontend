// api utilities for embeds
import type { Document, Note, Project } from "./types";
import { BASE_API_URL, EMBED_URL } from "@/config/config.js";
import * as documents from "$lib/api/documents";
import * as notes from "$lib/api/notes";
import * as projects from "$lib/api/projects";
import { pageSizes } from "$lib/utils/pageSize";

const resize = new URL("/embed/resize.js", EMBED_URL);

/**
 * Generate an oembed URL for a given DocumentCloud URL
 * @export
 */
export function embedUrl(url: URL | string): URL {
  const endpoint = new URL("oembed/", BASE_API_URL);
  endpoint.searchParams.set("url", url.toString());
  return endpoint;
}

// embed code generation
export function document(document: Document, params: URLSearchParams): string {
  // get dimensions for a document based on the first page
  const sizes = document.page_spec
    ? pageSizes(document.page_spec)
    : [[8.5, 11]];
  const page_size = sizes[0] ?? [];
  const width = page_size[0] ?? 8.5;
  const height = page_size[1] ?? 11;
  const style = `border: 1px solid #d8dee2; border-radius: 0.5rem; width: 100%; height: 100%; aspect-ratio: ${width} / ${height}`;

  const embedSrc = documents.embedUrl(document, params);
  embedSrc.searchParams.set("embed", "1");
  return `<iframe src="${embedSrc.href}" width="${width}" height="${height}" style="${style}" allow="fullscreen"></iframe>`;
}

export function page(document: Document, page: number = 1): string {
  const sizes = document.page_spec
    ? pageSizes(document.page_spec)
    : [[8.5, 11]];
  const page_size = sizes[page - 1] ?? [];
  const width = page_size[0] ?? 8.5;
  const height = page_size[1] ?? 11;
  const style = `border: none; width: 100%; height: 100%; aspect-ratio: ${width} / ${height}`;

  const embedSrc = documents.canonicalPageUrl(document, page, true);
  embedSrc.searchParams.set("embed", "1");
  return `<iframe src="${embedSrc.href}" width="${width}" height="${height}" style="${style}"></iframe>
<script defer src="${resize.href}"></script>`;
}

export function note(document: Document, note: Note) {
  const page = note.page_number;
  const sizes = document.page_spec
    ? pageSizes(document.page_spec)
    : [[8.5, 11]];
  const page_size = sizes[page - 1] ?? [];
  const width = page_size[0] ?? 8.5;
  const height = page_size[1] ?? 11;

  const note_width = note ? notes.width(note) * width : null;
  const note_height = note ? notes.height(note) * height : null;
  const note_style = `border: 1px solid #d8dee2; border-radius: 0.5rem; width: 100%; height: 100%; aspect-ratio: ${note_width} / ${note_height};`;

  const embedSrc = notes.canonicalNoteUrl(document, note);
  embedSrc.searchParams.set("embed", "1");
  return `<iframe src="${embedSrc.href}" width="${note_width}" height="${note_height}" style="${note_style}"></iframe>
<script defer src="${resize.href}"></script>`;
}

export function project(project: Project) {
  const embedSrc = projects.embedUrl(project);
  return `<iframe src="${embedSrc.href}" width="100%" height="600px"></iframe>`;
}
