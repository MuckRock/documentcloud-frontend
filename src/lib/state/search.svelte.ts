/**
 * Search state, for any route where we're searching documents and displaying results.
 * There should be at most one per page.
 *
 * This class manages visibility, selection and pagination.
 */

import type {
  APIError,
  APIResponse,
  Document,
  DocumentResults,
  Maybe,
  Nullable,
  Pending,
  SearchOptions,
} from "$lib/api/types";

import { createContext } from "svelte";
import { get, type Writable } from "svelte/store";
import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { search } from "$lib/api/documents";
import { isDefined } from "$lib/utils";
import { getApiResponse } from "$lib/utils/api";

interface Args {
  query?: Maybe<string>;
  options?: Maybe<SearchOptions>;
  loading?: boolean;
}

// these should match the stores $lib/api/documents.ts
interface WatchStores {
  deleted?: Writable<Set<string>>;
  edited?: Writable<Map<string, Document>>;
  pending?: Writable<Pending[]>;
  finished?: Writable<Set<number>>;
}

const EXPANDABLE_FIELDS = new Set(["user", "organization", "projects", "id"]);

export class SearchResultsState {
  visible: SvelteMap<string, Document> = new SvelteMap();
  selectedIds: SvelteSet<string> = new SvelteSet();
  total: number = $state(0);
  query: Maybe<string> = $state("");
  options: Maybe<SearchOptions> = $state();
  loading: boolean = $state(false);
  next: Nullable<string> = $state(null);
  error: Maybe<APIError<any>> = $state();

  watching: Record<string, () => void> = {};
  #stores: WatchStores = {};

  constructor({ query = "", options, loading = false }: Args = {}) {
    this.query = query;
    this.options = options;
    this.loading = loading;

    this.loadNext = this.loadNext.bind(this);
    this.watch = this.watch.bind(this);
    this.unwatch = this.unwatch.bind(this);
  }

  get results() {
    return this.visible.values();
  }

  get selected(): Document[] {
    return [...this.selectedIds]
      .map((id) => this.visible.get(id))
      .filter(isDefined<Document>);
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
      this.applyWatched();
    }

    this.loading = false;
  }

  /**
   * Handle initial search results, synchronously.
   * This kicks off downstream updates.
   */
  async setResults(results: Promise<APIResponse<DocumentResults, any>>) {
    this.loading = true;
    const { data: searchResults } = await results;
    if (!searchResults) {
      this.loading = false;
      return this;
    }

    this.visible.clear();
    for (const d of searchResults.results) {
      this.visible.set(String(d.id), d);
    }
    this.total = searchResults.count ?? searchResults.results.length;
    this.next = searchResults.next;
    this.applyWatched();
    this.loading = false;

    return this; // for chaining
  }

  /**
   * Load the next set of results, if available.
   * Search results include a `next` URL with a cursor for pagination.
   * This should append results to `visible`.
   *
   * Can return an error used in ResultsList
   */
  async loadNext(): Promise<Maybe<APIError<unknown>>> {
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
      this.applyWatched();
    }

    this.loading = false;

    // stash and return the error, even if it's undefined
    this.error = error;
    return error;
  }

  /**
   * Watch the stores.
   * Subscribe to stores to track deleted, edited and processing documents
   * and patch search results accordingly. This helps with optimistic updates
   * while our search API catches up to database changes.
   */
  watch(stores: WatchStores = {}) {
    this.#stores = stores;
    const { deleted, edited, pending, finished } = stores;

    if (deleted) {
      this.watching.deleted?.();
      this.watching.deleted = deleted.subscribe((v) => this.handleDeleted(v));
    }

    if (edited) {
      this.watching.edited?.();
      this.watching.edited = edited.subscribe((v) => this.handleEdited(v));
    }

    if (pending || finished) {
      this.watching.pending?.();
      this.watching.finished?.();

      if (pending) {
        this.watching.pending = pending.subscribe((v) => this.handlePending(v));
      }

      if (finished) {
        this.watching.finished = finished.subscribe((v) =>
          this.handleFinished(v),
        );
      }
    }
  }

  /**
   * Re-apply watched store values to visible results.
   * Call after populating visible from API results.
   */
  applyWatched() {
    const { deleted, edited, pending, finished } = this.#stores;
    if (deleted) this.handleDeleted(get(deleted));
    if (edited) this.handleEdited(get(edited));
    if (pending) this.handlePending(get(pending));
    if (finished) this.handleFinished(get(finished));
  }

  /**
   * Unsubscribe from all stores
   */
  unwatch() {
    for (const unsubscribe of Object.values(this.watching)) {
      unsubscribe();
    }
    this.#stores = {};
  }

  /**
   * Remove documents from visible and decrement total as needed
   */
  handleDeleted(deleted: Set<string>) {
    for (const id of deleted) {
      if (this.visible.delete(id)) {
        this.total = Math.max(0, this.total - 1);
      }
    }
  }

  handleEdited(edited: Map<string, Document>) {
    for (const [id, edit] of edited) {
      const doc = this.visible.get(id);
      if (doc) {
        for (const [k, v] of Object.entries(edit)) {
          // ignore expandable fields
          if (!EXPANDABLE_FIELDS.has(k)) {
            doc[k] = v;
          }
        }
        this.visible.set(id, { ...doc });
      }
    }
  }

  handlePending(pending: Pending[]) {
    for (const p of pending) {
      const id = String(p.doc_id);
      const doc = this.visible.get(id);
      if (doc && doc.status !== "pending") {
        this.visible.set(id, { ...doc, status: "pending" });
      }
    }
  }

  handleFinished(finished: Set<number>) {
    for (const docId of finished) {
      const id = String(docId);
      const doc = this.visible.get(id);
      if (doc && doc.status !== "success") {
        this.visible.set(id, { ...doc, status: "success" });
      }
    }
  }
}

export const [getSearchResults, setSearchResults] =
  createContext<SearchResultsState>();
