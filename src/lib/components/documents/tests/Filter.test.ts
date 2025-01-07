import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import Filter from "../Filter.svelte";

describe("Filter.svelte", () => {
  const defaultProps = {};

  it("renders and opens menu for snapshot", async () => {
    const { container, getByText, getByLabelText, getByPlaceholderText } =
      render(Filter, defaultProps);

    // Click to open the menu
    const filterButton = getByText("Filter");
    await fireEvent.click(filterButton);

    // Verify all select inputs are present
    expect(getByPlaceholderText("Access")).toBeDefined();
    expect(getByPlaceholderText("Users")).toBeDefined();
    expect(getByPlaceholderText("Organizations")).toBeDefined();
    expect(getByPlaceholderText("Projects")).toBeDefined();

    // Verify all number inputs are present
    expect(getByPlaceholderText("Min. Pages")).toBeDefined();
    expect(getByPlaceholderText("Max. Pages")).toBeDefined();

    // Verify advanced link is present
    expect(getByText("Advanced search syntax")).toBeDefined();

    expect(container).toMatchSnapshot();
  });
});
