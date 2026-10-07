import type { Maybe, Nullable } from "$lib/api/types";

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

/** pdf.js's default range size, so the first chunk matches the ones after it. */
const CHUNK_SIZE = 65536;

/**
 * Feeds pdf.js byte ranges from a signed URL, re-signing it when it expires.
 *
 * pdf.js's own loader keeps requesting the URL it opened with, and signed
 * private asset URLs expire within minutes of being issued.
 */
export class SignedRangeTransport extends pdfjs.PDFDataRangeTransport {
  #url: URL;
  #refresh: () => Promise<URL>;
  #refreshing: Maybe<Promise<URL>>;
  #controller = new AbortController();

  /** Called when a range can't be fetched; pdf.js has no way to hear about it. */
  onError?: (error: unknown) => void;

  /** Call `open()` before handing this to pdf.js, which reads its length then. */
  constructor(url: URL, refresh: () => Promise<URL>) {
    super(0, null);
    this.#url = url;
    this.#refresh = refresh;
  }

  /**
   * Read the file length and first chunk.
   *
   * Resolves false when ranges aren't usable: the server sent the whole file,
   * CORS hides the file length, or the request failed.
   */
  async open(): Promise<boolean> {
    try {
      const response = await this.#request(0, CHUNK_SIZE);
      // Content-Range: bytes 0-65535/<length>
      const length = Number(
        response.headers.get("Content-Range")?.split("/")[1],
      );
      if (response.status !== 206 || !length) {
        await response.body?.cancel();
        return false;
      }

      this.length = length;
      this.initialData = new Uint8Array(await response.arrayBuffer());
      return true;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  requestDataRange(begin: number, end: number): void {
    const { signal } = this.#controller;
    this.#request(begin, end, signal)
      .then(async (response) => {
        if (response.status !== 206) {
          throw new Error(`Range request failed: ${response.status}`);
        }
        return new Uint8Array(await response.arrayBuffer());
      })
      .then(
        (chunk) => {
          // pdf.js throws on a range it is no longer waiting for.
          if (!signal.aborted) this.onDataRange(begin, chunk);
        },
        (error) => {
          if (!signal.aborted) this.onError?.(error);
        },
      );
  }

  abort(): void {
    this.#controller.abort();
  }

  /** Fetch bytes [begin, end), re-signing the URL once if it has expired. */
  async #request(begin: number, end: number, signal?: AbortSignal) {
    const fetchFrom = (url: URL) =>
      fetch(url, { headers: { Range: `bytes=${begin}-${end - 1}` }, signal });

    const url = this.#url;
    const response = await fetchFrom(url);
    if (response.status !== 403) return response;
    return fetchFrom(await this.#resign(url));
  }

  /** A URL signed after `expired`, shared by every range that failed with it. */
  #resign(expired: URL): Promise<URL> {
    if (this.#url !== expired) return Promise.resolve(this.#url);
    this.#refreshing ??= this.#refresh()
      .then((url) => (this.#url = url))
      .finally(() => (this.#refreshing = undefined));
    return this.#refreshing;
  }
}

/** Open a range transport on a signed PDF URL, or null if ranges aren't usable. */
export async function openSignedRange(
  url: URL,
  refresh: () => Promise<URL>,
): Promise<Nullable<SignedRangeTransport>> {
  const transport = new SignedRangeTransport(url, refresh);
  return (await transport.open()) ? transport : null;
}
