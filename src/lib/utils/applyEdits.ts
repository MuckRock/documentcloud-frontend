import { edited, DEFAULT_EXPAND } from "$lib/api/documents";
import type { Document } from "$lib/api/types";

/**
 * Merge document edits in the edited store, optionally stripping expandable fields.
 */
export const applyEdits = (
  documents?: Partial<Document> | Partial<Document>[],
  stripExpandable = true,
) => {
  edited.update((m) => {
    if (!documents) return m;

    if (!Array.isArray(documents)) {
      documents = [documents];
    }

    documents.forEach(({ id, ...document }) => {
      const key = String(id);
      if (stripExpandable) {
        for (const field of DEFAULT_EXPAND) {
          delete document[field];
        }
      }
      const newEdits = Object.assign({}, m.get(key), document);
      m.set(key, newEdits);
    });

    return m;
  });
};
