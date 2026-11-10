import type { Nullable } from "$lib/api/types";

/** The `Last-Modified` header of a PDF, or null if it can't be read. */
export async function pdfModified(url: URL): Promise<Nullable<string>> {
  try {
    const response = await fetch(url, { headers: { Range: "bytes=0-0" } });
    await response.body?.cancel();
    return response.ok ? response.headers.get("Last-Modified") : null;
  } catch {
    return null;
  }
}
