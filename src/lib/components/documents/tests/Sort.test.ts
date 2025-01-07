import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Sort from "../Sort.svelte";
import type { SortField, SortOrder } from "../Sort.svelte";

describe("Sort.svelte", () => {
  const defaultProps = {
    order: "desc" as SortOrder,
    sort: "created_at" as SortField,
    fields: ["created_at", "title", "page_count"] as SortField[],
    query: "",
  };

  it("renders and opens menu for snapshot", async () => {
    const { container, getByText, getByLabelText } = render(Sort, defaultProps);

    // Click to open the menu
    const sortButton = getByText("Sort");
    await fireEvent.click(sortButton);

    // Verify all radio inputs are present
    expect(getByLabelText("Ascending")).toBeDefined();
    expect(getByLabelText("Descending")).toBeDefined();
    expect(getByLabelText("Date Created")).toBeDefined();
    expect(getByLabelText("Title")).toBeDefined();
    expect(getByLabelText("Total Pages")).toBeDefined();

    expect(container).toMatchSnapshot();
  });

  it("updates sort and order when selecting options", async () => {
    const { getByText, getByLabelText } = render(Sort, {
      ...defaultProps,
      order: "desc",
      sort: "created_at",
    });

    // Open the menu
    const sortButton = getByText("Sort");
    await fireEvent.click(sortButton);

    // Change sort field to "title"
    const titleOption = getByLabelText("Title");
    await fireEvent.click(titleOption);

    // Change order to ascending
    const ascOption = getByLabelText("Ascending");
    await fireEvent.click(ascOption);

    // Check if radio inputs are selected
    const titleInput = titleOption.parentNode?.querySelector("input");
    const ascInput = ascOption.parentNode?.querySelector("input");
    expect(titleInput?.checked).toBe(true);
    expect(ascInput?.checked).toBe(true);
  });
});
