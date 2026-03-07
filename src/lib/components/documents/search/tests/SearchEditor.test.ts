import { vi, describe, it, expect } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/svelte";
import SearchEditor from "../SearchEditor.svelte";

/** Render the editor and wait for ProseMirror to initialize */
async function renderEditor(props: Record<string, unknown> = {}) {
  const result = render(SearchEditor, { props });
  // Flush microtasks so onMount fires and ProseMirror initializes
  await act();
  const editor = result.container.querySelector(".ProseMirror") as HTMLElement;
  return { ...result, editor };
}

describe("SearchEditor", () => {
  it("renders an editable element", async () => {
    const { editor } = await renderEditor();
    expect(editor).not.toBeNull();
    expect(editor).toBeInTheDocument();
    expect(editor.getAttribute("contenteditable")).toBe("true");
  });

  it("renders with an initial query", async () => {
    const { editor } = await renderEditor({ initialQuery: "hello world" });
    expect(editor.textContent).toContain("hello world");
  });

  it("renders empty when no initial query", async () => {
    const { editor } = await renderEditor();
    expect(editor.textContent?.trim()).toBe("");
  });

  it("renders a submit button", async () => {
    await renderEditor();
    const button = screen.getByRole("button", { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it("emits submit event with serialized query on form submission", async () => {
    const { component } = await renderEditor({
      initialQuery: "mueller report",
    });

    const submitSpy = vi.fn();
    component.$on("submit", submitSpy);

    const button = screen.getByRole("button", { name: /search/i });
    await act(() => {
      button.click();
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy.mock.calls[0][0].detail).toEqual({
      query: "mueller report",
    });
  });

  it("provides getQuery() that returns the serialized document", async () => {
    const { component } = await renderEditor({ initialQuery: "test query" });
    expect(component.getQuery()).toBe("test query");
  });

  it("updateQuery() replaces editor content", async () => {
    const { component, editor } = await renderEditor({
      initialQuery: "old query",
    });
    await act(() => {
      component.updateQuery("new query");
    });
    expect(editor.textContent).toContain("new query");
    expect(component.getQuery()).toBe("new query");
  });

  describe("deserialization on load (Phase 4)", () => {
    it("deserializes initialQuery with field-value into chips", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "user:102112 AND access:private",
      });
      // Should have chips rendered
      const chips = editor.querySelectorAll(".search-field-value");
      expect(chips.length).toBe(2);
      // Serialization should round-trip
      expect(component.getQuery()).toBe("user:102112 AND access:private");
    });

    it("deserializes initialQuery with sort into chip", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "sort:-created_at",
      });
      const sortChip = editor.querySelector(".search-sort");
      expect(sortChip).toBeInTheDocument();
      expect(component.getQuery()).toBe("sort:-created_at");
    });

    it("deserializes initialQuery with range into chip", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const rangeChip = editor.querySelector(".search-range");
      expect(rangeChip).toBeInTheDocument();
      expect(component.getQuery()).toBe("created_at:[NOW-1MONTH TO *]");
    });

    it("deserializes complex mixed query with chips and text", async () => {
      const { editor, component } = await renderEditor({
        initialQuery:
          "+user:102112 created_at:[NOW-1MONTH TO *] AND access:private sort:-page_count",
      });
      expect(editor.querySelectorAll(".search-field-value").length).toBe(2);
      expect(editor.querySelector(".search-range")).toBeInTheDocument();
      expect(editor.querySelector(".search-sort")).toBeInTheDocument();
    });

    it("leaves plain text fields as text", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "title:Mueller*",
      });
      // Should not create a chip for title
      const chips = editor.querySelectorAll(".search-field-value");
      expect(chips.length).toBe(0);
      expect(component.getQuery()).toBe("title:Mueller*");
    });

    it("updateQuery() also deserializes into structured nodes", async () => {
      const { editor, component } = await renderEditor();
      await act(() => {
        component.updateQuery("user:102112 sort:-page_count");
      });
      expect(editor.querySelectorAll(".search-field-value").length).toBe(1);
      expect(editor.querySelector(".search-sort")).toBeInTheDocument();
    });
  });
});
