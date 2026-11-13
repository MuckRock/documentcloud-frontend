/**
 * Viewer state encapsulates all data and state needed to render the document viewer.
 * There are three versions of the viewer: logged-in, logged-out and embed.
 *
 * This viewer state class should be a singleton for each document URL.
 */

import type {
  Document,
  DocumentLoadProgress,
  DocumentText,
  Maybe,
  Nullable,
  Note,
  ViewerMode,
  Zoom,
  BBox,
} from "$lib/api/types";

import type { VirtualizerHandle } from "virtua/svelte";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createContext } from "svelte";

import { assetUrl } from "$lib/api/documents";
import { pdfModified } from "$lib/utils/pdfModified";
import { openSignedRange } from "$lib/utils/pdfRange";
import { EditHistory } from "$lib/state/edit.svelte";
import { getPendingLayout } from "$lib/state/pendingLayout";
import { SvelteSet } from "svelte/reactivity";
import { pagesFromSpec } from "$lib/utils/pageSize";

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
}

export class ViewerState {
  // document parts
  document: Nullable<Document> = $state(null);
  notes: Note[] = $state([]); // loaded separately for performance
  text: Promise<Maybe<DocumentText>> = $state(new Promise(() => {}));
  assetUrl: Nullable<URL> = $state(null); // backend field is `asset_url`
  embed: boolean = $state(false);
  errors: Error[] = $state([]);
  mode: ViewerMode = $state("document");
  page: number = $state(1); // 1-indexed
  // A never-resolving placeholder until `loadPDF` runs. `null` means this viewer
  // has no PDF at all (e.g. a single-note embed), so consumers render from a
  // page image instead of loading the document.
  pdf: Nullable<Promise<pdfjs.PDFDocumentProxy>> = $state(
    new Promise(() => {}),
  );
  progress: DocumentLoadProgress = $state({ loaded: 0, total: 0 });
  /** `Last-Modified` of the current PDF */
  pdfModified: Nullable<string> = $state(null);
  zoom: Zoom = $state(1);

  // Reference to the currently mounted virtualizer
  virtualizerRef = $state<VirtualizerHandle>();

  // notes
  currentNote: Nullable<Note> = $state(null);
  newNote: Nullable<Partial<Note> & BBox> = $state(null);

  // internal PDF loading state
  #task: Nullable<pdfjs.PDFDocumentLoadingTask> = null;
  #opening = false;
  #opened = $state(false);
  #retriesOn403Error = 0;

  // edit history state
  pageSpec = $derived(this.document?.page_spec);
  #pendingLayout = $derived(
    this.document ? getPendingLayout(this.document) : null,
  );
  originalPages = $derived.by(() => {
    if (!this.document?.page_spec) return [];
    return this.#pendingLayout?.pages ?? pagesFromSpec(this.document.page_spec);
  });
  history = new EditHistory(() => this.originalPages);

  imageVersion = $derived(
    this.#pendingLayout?.imageVersion ?? this.document?.updated_at,
  );
  hasPendingLayout = $derived(
    !!this.pdfModified &&
      !!this.#pendingLayout?.pdfModified &&
      this.pdfModified !== this.#pendingLayout.pdfModified,
  );
  selectedPages = new SvelteSet<number>();

  selectPage = (id: number, multiple = false) => {
    const { pages, selectedPages } = this;
    if (selectedPages.has(id)) {
      return selectedPages.delete(id);
    }

    const first = pages.findIndex((p) => selectedPages.has(p.id));
    if (!multiple || first === -1) {
      return selectedPages.add(id);
    }

    const index = pages.findIndex((p) => p.id === id);
    const last = pages.findLastIndex((p) => selectedPages.has(p.id));
    const anchor = index < last ? first : last;

    pages
      .slice(Math.min(anchor, index), Math.max(anchor, index) + 1)
      .forEach((p) => selectedPages.add(p.id));
  };

  // The scrolling ancestor of the document
  scrollContainer = $state<HTMLElement>();
  innerContainer = $state<HTMLElement>();

  startMargin = $derived.by(() => {
    // The vertical offset depends on the viewer width, so recalculate when it changes
    this.width;
    return (
      (this.innerContainer?.getBoundingClientRect().top ?? 0) -
      (this.scrollContainer?.getBoundingClientRect().top ?? 0) +
      (this.scrollContainer?.scrollTop ?? 0)
    );
  });

  // state and deriveds for zoom calculations
  // regardless of zoom mode, we always calculate auto zoom scale to display in select menu
  width = $state<number>();
  pages = $derived(this.history.current!);
  maxPageWidth = $derived(Math.max(...this.pages.map(({ width }) => width)));
  autoZoomScale = $derived.by(() => {
    if (!this.width) return 1;
    return Math.min(1, this.width / this.maxPageWidth);
  });
  scale = $derived.by(() => {
    if (typeof this.zoom === "number") return this.zoom;
    if (this.zoom === "auto") return this.autoZoomScale;
    return 1;
  });

  // Props object to spread onto the Virtualizer in PDF.svelte
  virtualizerProps = $derived({
    scrollRef: this.scrollContainer,
    startMargin: this.startMargin,
  });

  /** Fraction of the PDF loaded, or 1 once pdf.js has opened it. */
  get loadingProgress(): number {
    // With range requests most of the file is never fetched, so bytes
    // loaded never reach the total.
    if (this.#opened) return 1;
    if (this.progress.total === 0) return 0;
    return this.progress.loaded / this.progress.total;
  }

  /*
   * Scroll a page into view.
   * To change the page state without scrolling, just assign to viewer.page directly.
   */
  goToPage(page: number) {
    this.page = page;

    this.virtualizerRef?.scrollToIndex(page - 1, {
      align: "start",
      // Should match the scroll-margin-top value in components/viewer/Page.svelte
      offset: -96,
    });
  }

  /**
   * Load the PDF from an asset URL, tracking progress and errors.
   * On a 403 (expired private asset URL), retry with a fresh URL up to 5 times.
   */
  loadPDF(url: URL): void {
    if (this.#task || this.#opening) return;

    const document = this.document;
    // Only an editor can have a pending layout here
    const modified = document?.edit_access
      ? pdfModified(url).then((modified) => (this.pdfModified = modified))
      : Promise.resolve();

    const pdf =
      !document || document.access === "public"
        ? this.#open({ url })
        : this.#openSigned(url, document);
    this.pdf = modified.then(() => pdf);
  }

  /** Signed private URLs expire before pdf.js has read every page it needs. */
  async #openSigned(url: URL, document: Document) {
    this.#opening = true;
    const range = await openSignedRange(url, () => assetUrl(document));
    this.#opening = false;
    if (!range) return this.#open({ url });
    range.onError = (error) => this.#fail(error);
    return this.#open({ range });
  }

  reloadPDF(url: URL): void {
    this.#task?.destroy();
    this.#task = null;
    this.#opening = false;
    this.#opened = false;
    this.#retriesOn403Error = 0;
    this.progress = { loaded: 0, total: 0 };
    this.pdfModified = null;
    this.loadPDF(url);
  }

  #open(source: { url: URL } | { range: pdfjs.PDFDataRangeTransport }) {
    // pdf.js pre-fetches the whole file unless both are set, which exhausts
    // memory on very large documents.
    this.#task = pdfjs.getDocument({
      ...source,
      disableAutoFetch: true,
      disableStream: true,
    });
    this.#task.promise.then(
      () => (this.#opened = true),
      () => {}, // handled below
    );

    this.#task.onProgress = (p: DocumentLoadProgress) => {
      this.progress = p;
    };

    this.#task.promise.catch(async (error) => {
      if (
        error.status === 403 &&
        this.#retriesOn403Error < 5 &&
        this.document
      ) {
        // try to load the document again using a fresh asset_url
        const freshUrl = await assetUrl(this.document);
        this.#task = null;
        this.#retriesOn403Error++;
        this.loadPDF(freshUrl);
      } else {
        this.#fail(error);
        throw error;
      }
    });

    return this.#task.promise;
  }

  #fail(error: unknown) {
    console.error(error);
    this.errors = [...this.errors, error as Error];
  }
}

export const [getViewerState, setViewerState] = createContext<ViewerState>();
