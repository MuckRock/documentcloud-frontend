import { vi, describe, it, beforeEach, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { document } from "@/test/fixtures/documents";
import DocumentListItem from "../DocumentListItem.svelte";

describe("DocumentListItem", async () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, "now").mockReturnValue(1620000000000); // Mocked timestamp
  });
  it("renders", () => {
    let result = render(DocumentListItem, { document });
    expect(result.container).toMatchSnapshot();
  });
});
