import type { Document } from "$lib/api/types";

import { browser } from "$app/environment";
import { fromStore, get, writable } from "svelte/store";

import { Page } from "$lib/utils/page.svelte";
import { saveStore } from "$lib/utils/storage";

export interface PendingLayout {
  pageSpec: Document["page_spec"];
  imageVersion: string;
  pdfModified: string | null;
  pages: Page[];
}

const pendingLayouts = writable<Record<string, PendingLayout>>({});

if (browser) {
  saveStore(pendingLayouts, "pendingLayouts", {
    storage: localStorage,
    deserialize: (saved) =>
      JSON.parse(saved, (key, value) =>
        key === "pages" ? value.map((page) => new Page(page)) : value,
      ),
  });
}

const layouts = fromStore(pendingLayouts);

export function savePendingLayout(
  { id, page_spec: pageSpec, updated_at: imageVersion }: Document,
  pages: Page[],
  pdfModified: string | null,
) {
  pendingLayouts.update((all) => ({
    ...all,
    [id]: { pageSpec, imageVersion, pdfModified, pages },
  }));
}

/**
 * Get the client-side layout for a modified document that is still processing.
 */
export function getPendingLayout(document: Document): PendingLayout | null {
  if (document.status !== "pending") return null;

  const layout = layouts.current[document.id];
  // The API only rewrites page_spec when processing finishes.
  if (!layout || layout.pageSpec !== document.page_spec) return null;

  return layout;
}

/** Forget a document's pending layout. */
export function clearPendingLayout(id: Document["id"]) {
  if (!(id in get(pendingLayouts))) return;

  pendingLayouts.update(({ [id]: _, ...rest }) => rest);
}
