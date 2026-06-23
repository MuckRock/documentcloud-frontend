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

export interface DocDetail extends DocSummary {
  access: "public" | "private" | "organization";
  description: string;
}

/**
 * Fetch the document detail JSON via the authenticated request context, or
 * `undefined` if the request failed. The detail endpoint reflects edits
 * immediately (unlike the viewer header, which can lag backend indexing), so
 * it's the reliable place to assert a field changed — pair it with
 * `expect.poll`.
 */
export async function fetchDoc(
  page: Page,
  docApiUrl: string,
): Promise<DocDetail | undefined> {
  const r = await page.request.get(docApiUrl);
  return r.ok() ? ((await r.json()) as DocDetail) : undefined;
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
 * Drag a rectangle across a drawing layer (a note annotation layer or a
 * redaction layer). Uses fractional offsets so the box stays within the layer
 * whatever its rendered size.
 */
export async function drawBox(
  page: Page,
  layer: Locator,
  { fromX = 0.15, fromY = 0.08, toX = 0.6, toY = 0.22 } = {},
): Promise<void> {
  const box = await layer.boundingBox();
  if (!box) throw new Error("drawBox: layer has no bounding box");
  await page.mouse.move(box.x + box.width * fromX, box.y + box.height * fromY);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * toX, box.y + box.height * toY, {
    steps: 12,
  });
  await page.mouse.up();
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

export interface UploadedDoc {
  id: number;
  /** Document detail API URL, derived from the create response. */
  docApiUrl: string;
}

/**
 * Upload a single document through the UI and return its id and API URL. Stops
 * once the document is created; callers wait for processing separately (via
 * `waitForProcessed`). Shared by every spec that needs a throwaway document.
 */
export async function uploadDocument(
  page: Page,
  { title, fixture }: { title: string; fixture: string },
): Promise<UploadedDoc> {
  await page.goto("/upload/");

  // "Select Files" is disabled until the component hydrates and reads the CSRF
  // token, so waiting for it to enable also ensures the picker handler is wired.
  const selectFiles = page.getByRole("button", {
    name: "Select Files",
    exact: true,
  });
  await expect(selectFiles).toBeEnabled();

  // Drive the real file chooser rather than poking the hidden <input>, so the
  // component's onchange handler actually runs and registers the file.
  const fileChooser = page.waitForEvent("filechooser");
  await selectFiles.click();
  await (await fileChooser).setFiles(fixture);

  const titleInput = page.locator('input[name="title"]');
  await expect(titleInput).toBeVisible();
  await titleInput.fill(title);

  // The upload happens client-side, hitting the API directly. Capture the
  // create call (POST .../api/documents/) to learn the new document's id.
  const createResponse = page.waitForResponse(
    (r) =>
      r.request().method() === "POST" &&
      /\/documents\/$/.test(new URL(r.url()).pathname),
  );
  await page.getByRole("button", { name: "Begin Upload", exact: true }).click();

  const created = await createResponse;
  expect(created.ok()).toBeTruthy();
  const { id } = await created.json();
  expect(id, "create response should include a document id").toBeTruthy();

  // Derive the document API URL from the create endpoint so we don't hardcode
  // the API host (it differs between dev / staging / previews).
  const docApiUrl = created
    .url()
    .replace(/\/documents\/$/, `/documents/${id}/`);
  return { id, docApiUrl };
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
