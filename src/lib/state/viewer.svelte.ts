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

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { createContext } from "svelte";

import { assetUrl } from "$lib/api/documents";

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
}

export class ViewerState {
  // document parts
  document: Nullable<Document> = $state(null);
  text: Promise<Maybe<DocumentText>> = $state(new Promise(() => {}));
  assetUrl: Nullable<URL> = $state(null); // backend field is `asset_url`
  embed: boolean = $state(false);
  errors: Error[] = $state([]);
  mode: ViewerMode = $state("document");
  page: number = $state(1); // 1-indexed
  pdf: Promise<pdfjs.PDFDocumentProxy> = $state(new Promise(() => {}));
  progress: DocumentLoadProgress = $state({ loaded: 0, total: 0 });
  zoom: Zoom = $state(1);

  // notes
  currentNote: Nullable<Note> = $state(null);
  newNote: Nullable<Partial<Note> & BBox> = $state(null);

  // internal PDF loading state
  #task: Nullable<pdfjs.PDFDocumentLoadingTask> = null;
  #retriesOn403Error = 0;

  get loadingProgress(): number {
    if (this.progress.total === 0) return 0;
    return this.progress.loaded / this.progress.total;
  }

  /**
   * Load the PDF from an asset URL, tracking progress and errors.
   * On a 403 (expired private asset URL), retry with a fresh URL up to 5 times.
   */
  loadPDF(url: URL): void {
    if (this.#task) return;

    this.#task = pdfjs.getDocument({ url });
    this.pdf = this.#task.promise;

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
        console.error(error);
        this.errors = [...this.errors, error];
        throw error;
      }
    });
  }
}

export const [getViewerState, setViewerState] = createContext<ViewerState>();
