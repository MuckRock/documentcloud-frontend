import { describe, it, expect } from "vitest";
import { writable } from "svelte/store";
import {
  act,
  render,
  screen,
  fireEvent,
  createEvent,
} from "@testing-library/svelte";

import DocumentUploadForm from "../Upload.svelte";
import { PDF_SIZE_LIMIT } from "@/config/config";
import { me } from "@/test/fixtures/accounts";

describe("DocumentUpload form", () => {
  it("lists files selected for upload", async () => {
    render(DocumentUploadForm, { user: writable(me), csrf_token: "token" });
    const dropElement = screen.getByText(
      "Select, paste or drag-and-drop files to upload",
    );
    const dropEvent = createEvent.drop(dropElement);
    const fileList = [new File([new ArrayBuffer(128000)], "file.pdf")];
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: fileList,
      },
    });
    await act(() => fireEvent(dropElement, dropEvent));
    const fileListItem = screen.getByRole("listitem");
    expect(fileListItem.textContent).toContain("128 kB");
  });

  it("provides feedback when a file is too large", async () => {
    render(DocumentUploadForm, { user: writable(me), csrf_token: "token" });
    const dropElement = screen.getByText(
      "Select, paste or drag-and-drop files to upload",
    );
    const dropEvent = createEvent.drop(dropElement);
    const fileList = [
      new File([new ArrayBuffer(PDF_SIZE_LIMIT + 1)], "file.pdf"),
    ];
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: fileList,
      },
    });
    await act(() => fireEvent(dropElement, dropEvent));
    const fileListItem = screen.getByRole("listitem");
    expect(fileListItem.textContent).toContain(
      "The maximum size for a PDF is 500MB",
    );
  });
});
