import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { openSignedRange, SignedRangeTransport } from "../pdfRange";

const SIGNED = new URL("https://s3.example.com/doc.pdf?X-Amz-Signature=old");
const FRESH = new URL("https://s3.example.com/doc.pdf?X-Amz-Signature=new");
const LENGTH = 200_000;

/** A 206 response carrying `size` bytes of a LENGTH-byte file. */
function partial(begin: number, size: number) {
  return new Response(new Uint8Array(size).fill(7), {
    status: 206,
    headers: {
      "Content-Range": `bytes ${begin}-${begin + size - 1}/${LENGTH}`,
    },
  });
}

const forbidden = () => new Response("expired", { status: 403 });

/** The `Range` header of the nth fetch. */
function rangeOf(n: number) {
  const init = fetchMock.mock.calls[n]![1] as RequestInit;
  return new Headers(init.headers).get("Range");
}

const urlOf = (n: number) => String(fetchMock.mock.calls[n]![0]);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("openSignedRange", () => {
  it("reads the file length and first chunk from a single range request", async () => {
    fetchMock.mockResolvedValueOnce(partial(0, 65536));

    const transport = await openSignedRange(SIGNED, vi.fn());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(rangeOf(0)).toBe("bytes=0-65535");
    expect(transport?.length).toBe(LENGTH);
    expect(transport?.initialData?.byteLength).toBe(65536);
  });

  it("re-signs the URL when it has already expired", async () => {
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(partial(0, 65536));
    const refresh = vi.fn().mockResolvedValue(FRESH);

    const transport = await openSignedRange(SIGNED, refresh);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(urlOf(1)).toBe(FRESH.href);
    expect(transport?.length).toBe(LENGTH);
  });

  it("returns null when the server sends the whole file instead of a range", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array(10), { status: 200 }),
    );

    expect(await openSignedRange(SIGNED, vi.fn())).toBeNull();
  });

  it("returns null when the file length is hidden from the page", async () => {
    // Without CORS exposing Content-Range, the browser hides it.
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array(10), { status: 206 }),
    );

    expect(await openSignedRange(SIGNED, vi.fn())).toBeNull();
  });

  it("returns null when the request fails", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    expect(await openSignedRange(SIGNED, vi.fn())).toBeNull();
  });
});

describe("SignedRangeTransport", () => {
  function makeTransport(refresh = vi.fn().mockResolvedValue(FRESH)) {
    const transport = new SignedRangeTransport(SIGNED, refresh);
    const received = vi.fn();
    transport.addRangeListener(received);
    return { transport, received, refresh };
  }

  it("delivers the bytes pdf.js asks for", async () => {
    fetchMock.mockResolvedValueOnce(partial(65536, 1000));
    const { transport, received } = makeTransport();

    transport.requestDataRange(65536, 66536);

    await vi.waitFor(() => expect(received).toHaveBeenCalled());
    // pdf.js's `end` is exclusive; HTTP ranges are inclusive.
    expect(rangeOf(0)).toBe("bytes=65536-66535");
    const [begin, chunk] = received.mock.calls[0]!;
    expect(begin).toBe(65536);
    expect(chunk.byteLength).toBe(1000);
  });

  it("re-signs the URL and retries when it expires mid-session", async () => {
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(partial(65536, 1000));
    const { transport, received, refresh } = makeTransport();

    transport.requestDataRange(65536, 66536);

    await vi.waitFor(() => expect(received).toHaveBeenCalled());
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(urlOf(1)).toBe(FRESH.href);
  });

  it("re-signs once for ranges that expire together", async () => {
    fetchMock.mockImplementation(async (url: URL, init: RequestInit) => {
      if (String(url) === SIGNED.href) return forbidden();
      const begin = Number(
        new Headers(init.headers).get("Range")!.match(/=(\d+)/)![1],
      );
      return partial(begin, 1000);
    });
    const { transport, received, refresh } = makeTransport();

    transport.requestDataRange(0, 1000);
    transport.requestDataRange(5000, 6000);
    transport.requestDataRange(9000, 10000);

    await vi.waitFor(() => expect(received).toHaveBeenCalledTimes(3));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("keeps using the re-signed URL for later ranges", async () => {
    fetchMock
      .mockResolvedValueOnce(forbidden())
      .mockResolvedValueOnce(partial(0, 1000))
      .mockResolvedValueOnce(partial(5000, 1000));
    const { transport, received } = makeTransport();

    transport.requestDataRange(0, 1000);
    await vi.waitFor(() => expect(received).toHaveBeenCalledTimes(1));
    transport.requestDataRange(5000, 6000);
    await vi.waitFor(() => expect(received).toHaveBeenCalledTimes(2));

    expect(urlOf(2)).toBe(FRESH.href);
  });

  it("reports a range it cannot fetch", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    const { transport, received } = makeTransport();
    const onError = vi.fn();
    transport.onError = onError;

    transport.requestDataRange(0, 1000);

    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    expect(received).not.toHaveBeenCalled();
  });

  it("drops ranges that arrive after pdf.js aborts", async () => {
    // pdf.js throws if handed a range it is no longer waiting for.
    const pending = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    const { transport, received } = makeTransport();
    const onError = vi.fn();
    transport.onError = onError;

    transport.requestDataRange(0, 1000);
    transport.abort();
    pending.resolve(partial(0, 1000));

    await new Promise((r) => setTimeout(r, 10));
    expect(received).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
