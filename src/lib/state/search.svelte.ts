/**
 * Search state, for any route where we're searching documents and displaying results.
 * There should be at most one per page.
 */

import type { Document } from "$lib/api/types";
import { createContext } from "svelte";

export class SearchResultsState {
  visible: Map<string, Document> = $state(new Map());
  selectedIds: string[] = $state([]);
  total: number = $state(0);

  get selected(): Document[] {
    return this.selectedIds
      .map((id) => this.visible.get(id))
      .filter(Boolean) as Document[];
  }

  get editable(): boolean {
    return (
      this.selected.length > 0 && this.selected.every((d) => d.edit_access)
    );
  }

  selectAll() {
    this.selectedIds = [...this.visible.keys()];
  }

  deselectAll() {
    this.selectedIds = [];
  }
}

export const [getSearchResults, setSearchResults] =
  createContext<SearchResultsState>();
