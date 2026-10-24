import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import EmbedLayout from "../EmbedLayout.svelte";

describe("EmbedLayout project navigation", () => {
  it("offers a labelled project link even without a visible project header", () => {
    render(EmbedLayout, {
      canonicalUrl: "https://www.documentcloud.org/projects/123-records/",
      type: "project",
    });
    const link = screen.getByRole("link", { name: "View project" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.documentcloud.org/projects/123-records/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not add a project button to document embeds", () => {
    render(EmbedLayout, {
      canonicalUrl: "https://www.documentcloud.org/documents/1/",
      type: "document",
    });
    expect(
      screen.queryByRole("link", { name: "View project" }),
    ).not.toBeInTheDocument();
  });
});
