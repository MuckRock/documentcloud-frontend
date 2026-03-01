/**
 * Search state, for any route where we're searching documents and displaying results.
 * There should be at most one per page.
 */

import type { Document } from "$lib/api/types";

import { createContext } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

export class SearchResultsState {
  visible: SvelteMap<string, Document> = new SvelteMap();
  selectedIds: SvelteSet<string> = new SvelteSet();
  total: number = $state(0);

  get selected(): Document[] {
    return [...this.selectedIds]
      .map((id) => this.visible.get(id))
      .filter(Boolean) as Document[];
  }

  get editable(): boolean {
    return (
      this.selected.length > 0 && this.selected.every((d) => d.edit_access)
    );
  }

  selectAll() {
    for (const key of this.visible.keys()) {
      this.selectedIds.add(key);
    }
  }

  deselectAll() {
    this.selectedIds.clear();
  }
}

export const [getSearchResults, setSearchResults] =
  createContext<SearchResultsState>();
