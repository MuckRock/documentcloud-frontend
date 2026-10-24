import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Data from "../Data.svelte";
import { documentExpanded } from "@/test/fixtures/documents";

describe("document URL metadata", () => {
  it.each(["https://example.org/source?id=1", "http://example.org/report"])(
    "opens %s without replacing metadata search",
    (value) => {
      const { container } = render(Data, {
        document: {
          ...documentExpanded,
          data: { source: [value] },
          edit_access: false,
        },
      });
      const destination = screen.getByRole("link", { name: value });
      expect(destination).toHaveAttribute("href", value);
      expect(destination).toHaveAttribute("target", "_blank");
      expect(destination).toHaveAttribute("rel", "noopener noreferrer");
      expect(
        screen.getByRole("link", { name: `source ${value}` }),
      ).toHaveAttribute("href", expect.stringContaining("documents/"));
      expect(container.querySelector("a a")).toBeNull();
    },
  );

  it.each([
    "javascript:alert(1)",
    "data:text/html,hello",
    "file:///etc/passwd",
    "//example.org",
    "not a URL",
  ])("keeps %s as searchable text without a destination link", (value) => {
    render(Data, {
      document: {
        ...documentExpanded,
        data: { source: [value] },
        edit_access: false,
      },
    });
    expect(screen.queryByRole("link", { name: value })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
