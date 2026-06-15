import type { Document, Note } from "$lib/api/types";

import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

import EditNote from "../EditNote.svelte";
import documentFixture from "@/test/fixtures/documents/document.json";
import { note as noteFixture } from "@/test/fixtures/notes";

// The component calls the notes API directly from the browser, so mock it.
vi.mock("$lib/api/notes", () => ({
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

// The CSRF token normally comes from a cookie.
vi.mock("$lib/utils/api", () => ({
  getCsrfToken: vi.fn(() => "test-csrf"),
}));

import * as notesApi from "$lib/api/notes";

const mockDocument = documentFixture as Document;

describe("EditNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the create form without a delete button", () => {
    render(EditNote, { document: mockDocument });

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("renders a delete button when editing an existing note", () => {
    render(EditNote, { document: mockDocument, note: { ...noteFixture } });

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("populates the fields from an existing note", () => {
    const { container } = render(EditNote, {
      document: mockDocument,
      note: { ...noteFixture },
    });

    expect(screen.getByDisplayValue(noteFixture.title)).toBeInTheDocument();

    const textarea = container.querySelector(
      "textarea[name='content']",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(noteFixture.content);
  });

  it("creates a new note on submit and fires onsuccess + onclose", async () => {
    vi.mocked(notesApi.create).mockResolvedValue({ data: noteFixture });

    const onsuccess = vi.fn();
    const onclose = vi.fn();

    render(EditNote, {
      document: mockDocument,
      note: { title: "New note", content: "Body", access: "public" },
      page_number: 3,
      onsuccess,
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(notesApi.create).toHaveBeenCalledWith(
      mockDocument.id,
      expect.objectContaining({
        title: "New note",
        content: "Body",
        access: "public",
        page_number: 3,
      }),
      "test-csrf",
    );
    expect(notesApi.update).not.toHaveBeenCalled();
    expect(onsuccess).toHaveBeenCalledWith(noteFixture);
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("updates an existing note on submit and fires onsuccess + onclose", async () => {
    const updated = { ...noteFixture, title: "Edited title" } as Note;
    vi.mocked(notesApi.update).mockResolvedValue({ data: updated });

    const onsuccess = vi.fn();
    const onclose = vi.fn();

    render(EditNote, {
      document: mockDocument,
      note: { ...noteFixture },
      onsuccess,
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(notesApi.update).toHaveBeenCalledWith(
      mockDocument.id,
      noteFixture.id,
      expect.objectContaining({
        title: noteFixture.title,
        content: noteFixture.content,
        access: noteFixture.access,
      }),
      "test-csrf",
    );
    expect(notesApi.create).not.toHaveBeenCalled();
    expect(onsuccess).toHaveBeenCalledWith(updated);
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("removes a note when the delete button is clicked", async () => {
    vi.mocked(notesApi.remove).mockResolvedValue({ data: null });

    const onclose = vi.fn();

    render(EditNote, {
      document: mockDocument,
      note: { ...noteFixture },
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(notesApi.remove).toHaveBeenCalledWith(
      mockDocument.id,
      noteFixture.id,
      "test-csrf",
    );
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("shows an error and does not close when the API fails", async () => {
    vi.mocked(notesApi.create).mockResolvedValue({
      error: { status: 400, message: "Something went wrong" },
    });

    const onsuccess = vi.fn();
    const onclose = vi.fn();

    render(EditNote, {
      document: mockDocument,
      note: { title: "New note", content: "", access: "private" },
      onsuccess,
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong",
    );
    expect(onsuccess).not.toHaveBeenCalled();
    expect(onclose).not.toHaveBeenCalled();
  });

  it("calls onclose when the cancel button is clicked", async () => {
    const onclose = vi.fn();

    render(EditNote, { document: mockDocument, onclose });

    await fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
