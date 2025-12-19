import { describe, it, expect } from "vitest";
import { writable } from "svelte/store";
import {
  render,
  screen,
  fireEvent,
  createEvent,
  waitFor,
} from "@testing-library/svelte";

import DocumentUploadForm from "../Upload.svelte";
import { PDF_SIZE_LIMIT } from "@/config/config";
import { me } from "@/test/fixtures/accounts";

describe("DocumentUpload form", () => {
  it("lists files selected for upload", async () => {
    render(DocumentUploadForm, { user: writable(me), csrf_token: "token" });
    const dropzone = document.querySelector(
      '[aria-dropeffect="execute"]',
    ) as HTMLElement;
    const dropEvent = createEvent.drop(dropzone);
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [
          new File([new ArrayBuffer(128000)], "file.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });
    fireEvent(dropzone, dropEvent);
    const fileListItem = await waitFor(() => screen.getByRole("listitem"));
    expect(fileListItem.textContent).toContain("128 kB");
  });

  it("provides feedback when a file is too large", async () => {
    render(DocumentUploadForm, { user: writable(me), csrf_token: "token" });
    const dropzone = document.querySelector(
      '[aria-dropeffect="execute"]',
    ) as HTMLElement;
    const dropEvent = createEvent.drop(dropzone);
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [
          new File([new ArrayBuffer(PDF_SIZE_LIMIT + 1)], "file.pdf", {
            type: "application/pdf",
          }),
        ],
      },
    });
    fireEvent(dropzone, dropEvent);
    const fileListItem = await waitFor(() => screen.getByRole("listitem"));
    expect(fileListItem.textContent).toContain(
      "The maximum size for a PDF is 500MB",
    );
  });
});
