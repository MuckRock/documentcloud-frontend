import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Sort from "../Sort.svelte";
import type { SortField, SortDirection } from "../Sort.svelte";

describe("Sort.svelte", () => {
  const defaultProps = {
    direction: "forward" as SortDirection,
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
    expect(getByLabelText("Oldest")).toBeDefined();
    expect(getByLabelText("Newest")).toBeDefined();
    expect(getByLabelText("Date Created")).toBeDefined();
    expect(getByLabelText("Title")).toBeDefined();
    expect(getByLabelText("Page Count")).toBeDefined();

    expect(container).toMatchSnapshot();
  });

  it("updates sort and direction when selecting options", async () => {
    const { getByText, getByLabelText } = render(Sort, {
      ...defaultProps,
      direction: "reverse",
      sort: "created_at",
    });

    // Open the menu
    const sortButton = getByText("Sort");
    await fireEvent.click(sortButton);

    // Change sort field to "title"
    const titleOption = getByLabelText("Title");
    await fireEvent.click(titleOption);

    // Change direction to forward
    const forwardOption = getByLabelText("A–Z");
    await fireEvent.click(forwardOption);

    // Check if radio inputs are selected
    const titleInput = titleOption.parentNode?.querySelector("input");
    const forwardInput = forwardOption.parentNode?.querySelector("input");
    expect(titleInput?.checked).toBe(true);
    expect(forwardInput?.checked).toBe(true);
  });
});
