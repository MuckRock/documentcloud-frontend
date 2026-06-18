import {
  expect,
  type APIRequestContext,
  type Locator,
  type Page,
} from "@playwright/test";

// Mirrors the document `Status` union in src/lib/api/types.d.ts.
type DocStatus = "success" | "readable" | "pending" | "error" | "nofile";

export interface DocSummary {
  id: number;
  slug: string;
  title: string;
  status: DocStatus;
}

/**
 * Open a modal by clicking its trigger, retrying until the modal's form is
 * visible. A trigger's onclick only fires once the view has hydrated, so an
 * early click can silently no-op (it just focuses the button) — retry until the
 * modal actually appears.
 */
export async function openModalForm(
  trigger: Locator,
  form: Locator,
  { timeout = 20_000 }: { timeout?: number } = {},
): Promise<void> {
  await expect(async () => {
    await trigger.click();
    await expect(form).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout });
}

/**
 * A title unique to this run so every lifecycle step can find *our* document
 * by name — never "the newest document", which races other runs and test data.
 */
export function uniqueTitle(prefix = "E2E"): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix} ${stamp} ${rand}`;
}

/**
 * Poll the document API until it reaches a terminal state. Resolves with the
 * document once it is `success`; throws on `error` or on timeout.
 *
 * `nofile` and `pending`/`readable` are transient here: right after create the
 * browser is still PUTting the file to S3 and kicking off processing, so the
 * document briefly reports `nofile` before moving to `pending` → `success`.
 *
 * Uses `page.request` so the poll shares the authenticated session cookies and
 * can read the (private) document.
 */
export async function waitForProcessed(
  request: APIRequestContext,
  docApiUrl: string,
  { timeout = 120_000, interval = 2_000 } = {},
): Promise<DocSummary> {
  const deadline = Date.now() + timeout;
  let last: DocSummary | undefined;

  while (Date.now() < deadline) {
    const resp = await request.get(docApiUrl);
    if (resp.ok()) {
      last = (await resp.json()) as DocSummary;
      if (last.status === "success") return last;
      if (last.status === "error") {
        throw new Error(
          `Document ${last.id} failed processing (status: error).`,
        );
      }
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error(
    `Timed out waiting for document to process (last status: ${last?.status ?? "unknown"}).`,
  );
}

/**
 * Cleanup safety net: delete a document straight through the API, mirroring
 * what the app's `documents.destroy` does (CSRF token from the cookie, Referer
 * set to the frontend origin). Used in `finally` so a failed UI flow never
 * leaves an orphaned test document behind.
 */
export async function deleteDocument(
  page: Page,
  docApiUrl: string,
  referer: string,
): Promise<void> {
  const cookies = await page.context().cookies();
  const csrf = cookies.find((c) => c.name === "csrftoken")?.value ?? "";

  await page.request.delete(docApiUrl, {
    headers: {
      "X-CSRFToken": csrf,
      Referer: referer,
    },
  });
}
