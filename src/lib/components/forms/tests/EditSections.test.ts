import type { Document, Section } from "$lib/api/types";

import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/svelte";

import EditSections from "../EditSections.svelte";
import documentFixture from "@/test/fixtures/documents/document.json";

// The component calls the sections API directly from the browser, so mock it.
vi.mock("$lib/api/sections", () => ({
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

// Rows call invalidate() after a successful write.
vi.mock("$app/navigation", () => ({
  invalidate: vi.fn(),
}));

// The CSRF token normally comes from a cookie.
vi.mock("$lib/utils/api", () => ({
  getCsrfToken: vi.fn(() => "test-csrf"),
}));

import * as sectionsApi from "$lib/api/sections";

const baseDocument = documentFixture as Document;

/** A document with a couple of existing sections. */
function docWithSections(sections: Section[]): Document {
  return { ...baseDocument, sections } as Document;
}

const existingSections: Section[] = [
  { id: 1, page_number: 0, title: "Introduction" },
  { id: 2, page_number: 3, title: "Chapter Two" },
];

/** Return the "Add New Section" button (create mode) — there is only one. */
function addButton() {
  return screen.getByRole("button", { name: "Add New Section" });
}

/**
 * The last table row is the blank "new section" row. Grab its page-number
 * and title inputs so tests can fill them out.
 */
function newRowInputs(container: HTMLElement) {
  const newRow = container.querySelector("tr#section-new") as HTMLElement;
  const page = newRow.querySelector(
    "input[name='page_number']",
  ) as HTMLInputElement;
  const title = newRow.querySelector("input[name='title']") as HTMLInputElement;
  return { newRow, page, title };
}

describe("EditSections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a row for each existing section plus a blank new-section row", () => {
    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    // Existing sections render as edit rows keyed by id.
    expect(container.querySelector("tr#section-1")).toBeInTheDocument();
    expect(container.querySelector("tr#section-2")).toBeInTheDocument();
    // ...and there's always a blank "new" row.
    expect(container.querySelector("tr#section-new")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Introduction")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Chapter Two")).toBeInTheDocument();
  });

  it("shows the page number as 1-indexed for display", () => {
    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    const pageInput = (id: string) =>
      (
        container.querySelector(`tr#section-${id}`) as HTMLElement
      ).querySelector("input[name='page_number']") as HTMLInputElement;

    // page_number 0 -> display "1", page_number 3 -> display "4"
    expect(pageInput("1").value).toBe("1");
    expect(pageInput("2").value).toBe("4");
    // the blank new row also starts on the first page
    expect(pageInput("new").value).toBe("1");
  });

  it("creates a new section with the entered title and page number", async () => {
    vi.mocked(sectionsApi.create).mockResolvedValue({
      data: { id: 9, page_number: 4, title: "New Section" },
    });

    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    const { page, title } = newRowInputs(container);

    // User enters display page "5" (-> page_number 4) and a title.
    await fireEvent.input(page, { target: { value: "5" } });
    await fireEvent.input(title, { target: { value: "New Section" } });

    await fireEvent.click(addButton());

    expect(sectionsApi.create).toHaveBeenCalledWith(
      baseDocument.id,
      { title: "New Section", page_number: 4 },
      "test-csrf",
    );
  });

  // Regression guard: a blank row must default to the first page (page_number 0,
  // display "1"), not the old page_number 1 / display "2". Doc has page 1 free.
  it("creates a section on the default page when the page field is untouched", async () => {
    vi.mocked(sectionsApi.create).mockResolvedValue({
      data: { id: 9, page_number: 0, title: "Untouched" },
    });

    const { container } = render(EditSections, {
      document: docWithSections([]),
    });

    const { page, title } = newRowInputs(container);

    // Document the default the blank row starts on.
    const defaultDisplay = page.value;

    await fireEvent.input(title, { target: { value: "Untouched" } });
    await fireEvent.click(addButton());

    expect(sectionsApi.create).toHaveBeenCalledTimes(1);
    const [, section] = vi.mocked(sectionsApi.create).mock.calls[0]!;
    // A blank row should submit the first page (display "1" -> page_number 0).
    expect({ defaultDisplay, submitted: section.page_number }).toEqual({
      defaultDisplay: "1",
      submitted: 0,
    });
  });

  it("prefills the new-section row from the passed-in section", () => {
    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
      section: { page_number: 5, title: "Prefilled" },
    });

    const { page, title } = newRowInputs(container);

    expect(title.value).toBe("Prefilled");
    // page_number 5 -> display "6"
    expect(page.value).toBe("6");
  });

  it("starts the new row blank when the passed-in section already exists", () => {
    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
      // an existing section (has an id) is already shown in the list above
      section: { id: 2, page_number: 3, title: "Chapter Two" },
    });

    const { title } = newRowInputs(container);
    expect(title.value).toBe("");
  });

  it("updates an existing section when its update button is clicked", async () => {
    vi.mocked(sectionsApi.update).mockResolvedValue({
      data: { id: 1, page_number: 0, title: "Introduction" },
    });

    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    const row = container.querySelector("tr#section-1") as HTMLElement;
    const updateBtn = within(row).getByRole("button", {
      name: "Update Section",
    });

    await fireEvent.click(updateBtn);

    expect(sectionsApi.update).toHaveBeenCalledWith(
      baseDocument.id,
      1,
      expect.objectContaining({ id: 1, title: "Introduction" }),
      "test-csrf",
    );
  });

  it("removes a section when its delete button is clicked", async () => {
    vi.mocked(sectionsApi.remove).mockResolvedValue({ data: null });

    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    const row = container.querySelector("tr#section-2") as HTMLElement;
    const deleteBtn = within(row).getByRole("button", { name: "Delete" });

    await fireEvent.click(deleteBtn);

    expect(sectionsApi.remove).toHaveBeenCalledWith(
      baseDocument.id,
      2,
      "test-csrf",
    );
  });

  it("warns and disables adding when the new page collides with an existing section", () => {
    render(EditSections, {
      document: docWithSections(existingSections),
      // page_number 3 already exists (Chapter Two)
      section: { page_number: 3, title: "Collision" },
    });

    expect(
      screen.getByText(/already a section starting on page/),
    ).toBeInTheDocument();
    expect(addButton()).toBeDisabled();
  });

  it("calls onclose without creating when Done is clicked with an empty new row", async () => {
    const onclose = vi.fn();

    render(EditSections, {
      document: docWithSections(existingSections),
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(sectionsApi.create).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  // A user who fills the new row and clicks the prominent "Done" (not the row's
  // add button) should still get their section saved, not silently discarded.
  it("saves a filled-in new row when Done is clicked, then closes", async () => {
    vi.mocked(sectionsApi.create).mockResolvedValue({
      data: { id: 9, page_number: 4, title: "Via Done" },
    });
    const onclose = vi.fn();

    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
      onclose,
    });

    const { page, title } = newRowInputs(container);
    await fireEvent.input(page, { target: { value: "5" } });
    await fireEvent.input(title, { target: { value: "Via Done" } });

    await fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(sectionsApi.create).toHaveBeenCalledWith(
      baseDocument.id,
      { title: "Via Done", page_number: 4 },
      "test-csrf",
    );
    // onclose fires after create + invalidate resolve.
    await waitFor(() => expect(onclose).toHaveBeenCalledTimes(1));
  });

  it("does not save on Done when the new row would collide with an existing section", async () => {
    const onclose = vi.fn();

    render(EditSections, {
      document: docWithSections(existingSections),
      // page_number 3 already has a section
      section: { page_number: 3, title: "Collision" },
      onclose,
    });

    await fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(sectionsApi.create).not.toHaveBeenCalled();
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("shows the API error and does not close when create fails", async () => {
    vi.mocked(sectionsApi.create).mockResolvedValue({
      error: {
        status: 400,
        message: "Bad Request",
        errors: { page_number: ["Must be a valid page for the document"] },
      },
    });
    const onclose = vi.fn();

    const { container } = render(EditSections, {
      document: docWithSections([]),
      onclose,
    });

    const { title } = newRowInputs(container);
    await fireEvent.input(title, { target: { value: "Bad section" } });

    await fireEvent.click(addButton());

    // The validation detail is surfaced, and the modal stays open.
    expect(await screen.findByRole("alert")).toHaveTextContent("Bad Request");
    expect(
      screen.getByText(/Must be a valid page for the document/),
    ).toBeInTheDocument();
    expect(onclose).not.toHaveBeenCalled();
  });

  it("does not close on Done when create fails", async () => {
    vi.mocked(sectionsApi.create).mockResolvedValue({
      error: { status: 400, message: "Bad Request" },
    });
    const onclose = vi.fn();

    const { container } = render(EditSections, {
      document: docWithSections([]),
      onclose,
    });

    const { title } = newRowInputs(container);
    await fireEvent.input(title, { target: { value: "Bad section" } });

    await fireEvent.click(screen.getByRole("button", { name: "Done" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Bad Request");
    expect(onclose).not.toHaveBeenCalled();
  });

  it("shows an error when updating a section fails", async () => {
    vi.mocked(sectionsApi.update).mockResolvedValue({
      error: { status: 403, message: "Forbidden" },
    });

    const { container } = render(EditSections, {
      document: docWithSections(existingSections),
    });

    const row = container.querySelector("tr#section-1") as HTMLElement;
    await fireEvent.click(
      within(row).getByRole("button", { name: "Update Section" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
  });

  it("clears a previous error once an action succeeds", async () => {
    // First create fails...
    vi.mocked(sectionsApi.create).mockResolvedValueOnce({
      error: { status: 400, message: "Bad Request" },
    });

    const { container } = render(EditSections, {
      document: docWithSections([]),
    });

    const { title } = newRowInputs(container);
    await fireEvent.input(title, { target: { value: "Section" } });
    await fireEvent.click(addButton());
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    // ...then a retry succeeds and the error clears.
    vi.mocked(sectionsApi.create).mockResolvedValueOnce({
      data: { id: 5, page_number: 0, title: "Section" },
    });
    await fireEvent.click(addButton());

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });
});
