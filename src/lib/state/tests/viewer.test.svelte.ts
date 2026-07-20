/**
 * Unit tests for the ViewerState class.
 *
 * Uses the .svelte.ts extension so Svelte rune syntax ($state) inside the class
 * under test is compiled. `pdfjs` and the documents API are mocked so `loadPDF`
 * can be exercised without touching the network.
 */
import type { Document } from "$lib/api/types";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";

// `vi.mock` factories are hoisted above the file, so the mocks they reference
// must be created with `vi.hoisted`.
const { getDocument, assetUrl } = vi.hoisted(() => ({
  getDocument: vi.fn(),
  assetUrl: vi.fn(),
}));
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  // truthy workerSrc so the module-init guard skips `new URL(...)`
  GlobalWorkerOptions: { workerSrc: "mock-worker" },
  getDocument,
}));
vi.mock("$lib/api/documents", () => ({ assetUrl }));

import { ViewerState } from "$lib/state/viewer.svelte";
import documentFixture from "@/test/fixtures/documents/document.json";

const doc = documentFixture as unknown as Document;

/** A fake pdfjs loading task with a controllable promise. */
function makeTask(promise: Promise<unknown>) {
  return { promise, onProgress: null as unknown };
}

// The unrecoverable-error path re-throws inside a `.catch`, producing an
// intentionally floating rejection that mirrors production. Swallow it so it
// doesn't fail unrelated assertions.
const swallow = () => {};
beforeAll(() => process.on("unhandledRejection", swallow));
afterAll(() => process.off("unhandledRejection", swallow));

describe("ViewerState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("has sensible defaults", () => {
    const v = new ViewerState();
    expect(v.document).toBeNull();
    expect(v.mode).toBe("document");
    expect(v.page).toBe(1);
    expect(v.zoom).toBe(1);
    expect(v.embed).toBe(false);
    expect(v.errors).toEqual([]);
    expect(v.currentNote).toBeNull();
    expect(v.newNote).toBeNull();
    expect(v.progress).toEqual({ loaded: 0, total: 0 });
  });

  it("loadingProgress guards against a zero total", () => {
    const v = new ViewerState();
    expect(v.loadingProgress).toBe(0);
    v.progress = { loaded: 5, total: 0 };
    expect(v.loadingProgress).toBe(0);
  });

  it("loadingProgress reports the loaded ratio", () => {
    const v = new ViewerState();
    v.progress = { loaded: 3, total: 12 };
    expect(v.loadingProgress).toBe(0.25);
  });

  it("loadPDF stores the pdf promise and wires progress updates", async () => {
    const pdf = { numPages: 7 };
    const task = makeTask(Promise.resolve(pdf));
    getDocument.mockReturnValue(task);

    const v = new ViewerState();
    const url = new URL("https://example.com/doc.pdf");
    v.loadPDF(url);

    expect(getDocument).toHaveBeenCalledWith({ url });
    await expect(v.pdf).resolves.toBe(pdf);

    // the class installs its own onProgress handler on the task
    (task.onProgress as (p: unknown) => void)({ loaded: 4, total: 8 });
    expect(v.progress).toEqual({ loaded: 4, total: 8 });
  });

  it("loadPDF is a no-op while a task is already in flight", () => {
    getDocument.mockReturnValue(makeTask(Promise.resolve({})));
    const v = new ViewerState();
    v.loadPDF(new URL("https://example.com/a.pdf"));
    v.loadPDF(new URL("https://example.com/b.pdf"));
    expect(getDocument).toHaveBeenCalledTimes(1);
  });

  it("retries with a fresh asset URL on a 403", async () => {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    const firstTask = makeTask(Promise.reject(err));
    // keep the initial rejection from being flagged unhandled
    firstTask.promise.catch(() => {});
    const secondPdf = { numPages: 1 };
    const secondTask = makeTask(Promise.resolve(secondPdf));
    getDocument.mockReturnValueOnce(firstTask).mockReturnValueOnce(secondTask);

    const freshUrl = new URL("https://example.com/fresh.pdf");
    assetUrl.mockResolvedValue(freshUrl);

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/stale.pdf"));

    await vi.waitFor(() => expect(getDocument).toHaveBeenCalledTimes(2));
    expect(assetUrl).toHaveBeenCalledWith(doc);
    expect(getDocument).toHaveBeenLastCalledWith({ url: freshUrl });
    await expect(v.pdf).resolves.toBe(secondPdf);
  });

  it("records non-403 errors instead of retrying", async () => {
    const err = Object.assign(new Error("boom"), { status: 500 });
    const task = makeTask(Promise.reject(err));
    task.promise.catch(() => {});
    getDocument.mockReturnValue(task);

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/a.pdf"));

    await vi.waitFor(() => expect(v.errors).toContain(err));
    expect(assetUrl).not.toHaveBeenCalled();
  });

  it("stops retrying 403s after 5 attempts", async () => {
    const err = Object.assign(new Error("Forbidden"), { status: 403 });
    getDocument.mockImplementation(() => {
      const t = makeTask(Promise.reject(err));
      t.promise.catch(() => {});
      return t;
    });
    assetUrl.mockResolvedValue(new URL("https://example.com/fresh.pdf"));

    const v = new ViewerState();
    v.document = doc;
    v.loadPDF(new URL("https://example.com/stale.pdf"));

    // 1 initial + 5 retries
    await vi.waitFor(() => expect(getDocument).toHaveBeenCalledTimes(6));
    await vi.waitFor(() => expect(v.errors).toContain(err));
  });
});
