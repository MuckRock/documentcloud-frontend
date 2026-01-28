import { vi, describe, it, beforeEach, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { document } from "@/test/fixtures/documents";
import DocumentListItem from "../DocumentListItem.svelte";

// Helper component to wrap DocumentListItem with context
import TestWrapper from "./EmbedContext.demo.svelte";

describe("DocumentListItem", async () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, "now").mockReturnValue(1620000000000); // Mocked timestamp
  });
  it("renders", () => {
    let result = render(DocumentListItem, { document });
    expect(result.container).toMatchSnapshot();
  });

  it("sets target='_blank' on all links when embed context is true", () => {
    const result = render(TestWrapper, {
      props: {
        component: DocumentListItem,
        embed: true,
        document,
      },
    });

    // Get all anchor tags
    const links = result.container.querySelectorAll("a");

    // Verify that we have links (document should have at least thumbnail and title links)
    expect(links.length).toBeGreaterThan(0);

    // Check that all links have target="_blank"
    links.forEach((link) => {
      expect(link.getAttribute("target")).toBe("_blank");
    });
  });

  it("does not set target='_blank' on links when embed context is false", () => {
    const result = render(TestWrapper, {
      props: {
        component: DocumentListItem,
        embed: false,
        document,
      },
    });

    // Get all anchor tags
    const links = result.container.querySelectorAll("a");

    // Verify that we have links
    expect(links.length).toBeGreaterThan(0);

    // Check that no links have target="_blank"
    links.forEach((link) => {
      expect(link.getAttribute("target")).toBeNull();
    });
  });
});
