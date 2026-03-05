/**
 * Search state, for any route where we're searching documents and displaying results.
 * There should be at most one per page.
 *
 * This class manages visibility, selection and pagination.
 */

import type {
  APIResponse,
  Document,
  DocumentResults,
  Maybe,
  Nullable,
  SearchOptions,
} from "$lib/api/types";

import { createContext } from "svelte";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { search } from "$lib/api/documents";
import { getApiResponse } from "$lib/utils/api";

export class SearchResultsState {
  visible: SvelteMap<string, Document> = new SvelteMap();
  selectedIds: SvelteSet<string> = new SvelteSet();
  total: number = $state(0);
  query: Maybe<string> = $state("");
  options: Maybe<SearchOptions> = $state();
  loading: boolean = $state(false);
  next: Nullable<string> = $state(null);

  constructor(query?: Maybe<string>, options?: Maybe<SearchOptions>) {
    this.query = query;
    this.options = options;
  }

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

  /**
   * Load initial search results, clearing any previous results
   */
  async load(query: string, options?: SearchOptions, fetch = globalThis.fetch) {
    this.query = query;
    this.loading = true;

    const { data } = await search(this.query, options, fetch);

    if (data) {
      this.visible.clear();
      for (const d of data.results) {
        this.visible.set(String(d.id), d);
      }
      this.total = data.count ?? data.results.length;
      this.next = data.next;
    }

    this.loading = false;
  }

  /**
   * Handle initial search results, synchronously.
   * This kicks off downstream updates.
   */
  async setResults(getter: () => Promise<APIResponse<DocumentResults, any>>) {
    const { data: searchResults } = await getter();
    if (!searchResults) return;

    this.visible.clear();
    for (const d of searchResults.results) {
      this.visible.set(String(d.id), d);
    }
    this.total = searchResults.count ?? searchResults.results.length;
    this.next = searchResults.next;
  }

  /**
   * Load the next set of results, if available.
   * Search results include a `next` URL with a cursor for pagination.
   * This should append results to `visible`.
   *
   * Can return an error message used in ResultsList
   */
  async loadNext(): Promise<Maybe<string>> {
    if (!this.next) return;

    // one at a time
    if (this.loading) return;

    this.loading = true;
    const resp = await fetch(this.next, { credentials: "include" }).catch(
      console.warn,
    );

    const { data, error } = await getApiResponse<DocumentResults>(resp);

    if (data) {
      // append, don't replace
      for (const d of data.results) {
        this.visible.set(String(d.id), d);
      }

      if (data.count) {
        this.total = data.count;
      }
      this.next = data.next;
    }

    this.loading = false;

    // would it be better to just return the whole APIError?
    if (error) {
      return error.message;
    }
  }
}

export const [getSearchResults, setSearchResults] =
  createContext<SearchResultsState>();
