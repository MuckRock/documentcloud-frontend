import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import DropdownDemo from "./Dropdown.demo.svelte";

describe("Dropdown", () => {
  describe("Basic Functionality", () => {
    it("renders the anchor and dropdown content", () => {
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = screen.getByText("Open Menu");
      expect(anchor).toBeInTheDocument();
    });

    it("dropdown is initially closed", () => {
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).not.toHaveClass("open");
    });

    it("opens dropdown when anchor is clicked", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor");
      await user.click(anchor!);

      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");
    });

    it("closes dropdown when anchor is clicked again", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor")!;

      // Open
      await user.click(anchor);
      let dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");

      // Close
      await user.click(anchor);
      dropdown = document.querySelector(".dropdown");
      expect(dropdown).not.toHaveClass("open");
    });
  });

  describe("Keyboard Interaction", () => {
    it("opens dropdown with Enter key", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor") as HTMLElement;
      anchor.focus();
      await user.keyboard("{Enter}");

      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");
    });

    it("opens dropdown with Space key", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor") as HTMLElement;
      anchor.focus();
      await user.keyboard(" ");

      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");
    });

    it("opens dropdown with ArrowDown key", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor") as HTMLElement;
      anchor.focus();
      await user.keyboard("{ArrowDown}");

      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");
    });

    it("closes dropdown with Escape key", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor")!;

      // Open
      await user.click(anchor);
      let dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");

      // Close with Escape
      await user.keyboard("{Escape}");
      dropdown = document.querySelector(".dropdown");
      expect(dropdown).not.toHaveClass("open");
    });
  });

  describe("Click Outside Behavior", () => {
    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor")!;

      // Open
      await user.click(anchor);
      let dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");

      // Click outside
      await user.click(document.body);
      dropdown = document.querySelector(".dropdown");
      expect(dropdown).not.toHaveClass("open");
    });

    it("closes when clicking a menu item that calls close", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1", "Item 2", "Item 3"],
        },
      });

      const anchor = document.querySelector(".anchor")!;

      // Open
      await user.click(anchor);
      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");

      // Click inside dropdown on an item that calls close
      const item = screen.getByText("Item 1");
      await user.click(item);

      // Should be closed because the item called close()
      expect(dropdown).not.toHaveClass("open");
    });
  });

  describe("Props", () => {
    it("renders with border when border prop is true", () => {
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1"],
          border: true,
        },
      });

      const anchor = document.querySelector(".anchor");
      expect(anchor).toHaveClass("border");
    });

    it("applies custom position", async () => {
      const user = userEvent.setup();
      render(DropdownDemo, {
        props: {
          anchorText: "Open Menu",
          items: ["Item 1"],
          position: "bottom-end",
        },
      });

      const anchor = document.querySelector(".anchor")!;
      await user.click(anchor);

      // Position is applied via floating-ui, check that dropdown is visible
      const dropdown = document.querySelector(".dropdown");
      expect(dropdown).toHaveClass("open");
    });
  });
});
