import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/svelte";
import { TextSelection } from "prosemirror-state";
import SearchEditor from "../SearchEditor.svelte";
import { autocompletePluginKey } from "../plugins/autocomplete";

// Mock API modules for async autocomplete and enrichment
vi.mock("$lib/api/accounts", () => ({
  listUsers: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 100, name: "Alice Smith", username: "alice" },
        { id: 101, name: "Alice Jones", username: "alicej" },
        { id: 102112, name: "Bob Reporter", username: "bob" },
      ],
    },
  }),
  listOrgs: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 200, name: "Acme Corp" },
      ],
    },
  }),
}));

vi.mock("$lib/api/projects", () => ({
  list: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 300, title: "Project Alpha" },
      ],
    },
  }),
}));

vi.mock("$lib/api/documents", () => ({
  search: vi.fn().mockResolvedValue({
    data: {
      results: [
        { id: 400, title: "Test Document" },
      ],
    },
  }),
}));

/** Render the editor and wait for ProseMirror to initialize */
async function renderEditor(props: Record<string, unknown> = {}) {
  const result = render(SearchEditor, { props });
  // Flush microtasks so onMount fires and ProseMirror initializes
  await act();
  const editor = result.container.querySelector(".ProseMirror") as HTMLElement;
  return { ...result, editor };
}

/** Simulate typing text at the current cursor position in the PM editor. */
function typeInEditor(view: import("prosemirror-view").EditorView, text: string) {
  const { from } = view.state.selection;
  const tr = view.state.tr.insertText(text, from);
  view.dispatch(tr);
}

/** Get the current autocomplete plugin state. */
function getACState(view: import("prosemirror-view").EditorView) {
  return autocompletePluginKey.getState(view.state) as {
    active: boolean;
    loading: boolean;
    stage: string;
    fieldName: string | null;
    suggestions: Array<{ label: string; value: string }>;
    selectedIndex: number;
  };
}

describe("SearchEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

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
      q: "mueller report",
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

  describe("autocomplete (Phase 5)", () => {
    it("typing a field prefix activates autocomplete in field stage", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");
      expect(state.suggestions.some((s) => s.value === "access")).toBe(true);
    });

    it("typing a field:value prefix activates value stage", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "access:"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("value");
      expect(state.fieldName).toBe("access");
      expect(state.suggestions.some((s) => s.value === "public")).toBe(true);
    });

    it("value stage filters as more text is typed", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "access:p"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.suggestions.every((s) => s.value.startsWith("p"))).toBe(
        true,
      );
    });

    it("Escape dismisses autocomplete", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));
      expect(getACState(view).active).toBe(true);

      // Simulate Escape keydown
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });

      expect(getACState(view).active).toBe(false);
    });

    it("dismissed autocomplete reactivates on next doc change", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
      expect(getACState(view).active).toBe(false);

      // Typing more text should reactivate
      await act(() => typeInEditor(view, "e"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.suggestions.some((s) => s.value === "access")).toBe(true);
    });

    it("plain-text field does not show value suggestions", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "title:"));

      const state = getACState(view);
      // title has no value suggestions, so autocomplete should be inactive
      expect(state.active).toBe(false);
    });

    it("sort: triggers value stage with sort options", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "sort:"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("value");
      expect(state.fieldName).toBe("sort");
      expect(state.suggestions.some((s) => s.value === "created_at")).toBe(
        true,
      );
    });

    it("sets aria-expanded when autocomplete is active", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      expect(editor.getAttribute("aria-expanded")).toBe("false");

      await act(() => typeInEditor(view, "acc"));

      expect(editor.getAttribute("aria-expanded")).toBe("true");
    });

    it("sets aria-activedescendant to the selected option", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));

      const activeId = editor.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      expect(activeId).toContain("opt-0");
    });
  });

  describe("async autocomplete (Phase 6)", () => {
    it("typing user: activates value stage with loading state", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "user:"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.loading).toBe(true);
      expect(state.stage).toBe("value");
      expect(state.fieldName).toBe("user");
      expect(state.suggestions).toEqual([]);
    });

    it("shows loading indicator in dropdown for async fields", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "user:"));

      const loading = document.querySelector(".search-ac-loading");
      expect(loading).not.toBeNull();
      expect(loading?.textContent).toContain("Loading");
    });

    it("populates suggestions after async fetch completes", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "user:Ali"));

      // Advance past debounce timer
      await act(async () => {
        vi.advanceTimersByTime(350);
        // Allow the async fetch promise to resolve
        await vi.runAllTimersAsync();
      });

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.suggestions.length).toBeGreaterThan(0);
      expect(state.suggestions.some((s) => s.label === "Alice Smith")).toBe(true);
    });

    it("sets displayValue when selecting an async suggestion", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "user:Ali"));

      // Wait for async suggestions
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Select with Enter
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // The chip should have displayValue set
      const doc = view.state.doc;
      let chipFound = false;
      doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "user") {
          expect(node.attrs.displayValue).toBe("Alice Smith");
          chipFound = true;
        }
      });
      expect(chipFound).toBe(true);
    });
  });

  describe("chip enrichment (Phase 6)", () => {
    it("enriches chips with display names on initial load", async () => {
      const { component } = await renderEditor({
        initialQuery: "user:102112",
      });

      // Wait for enrichment to complete
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      const view = component.getView();
      let enriched = false;
      view.state.doc.descendants((node) => {
        if (
          node.type.name === "field-value" &&
          node.attrs.field === "user" &&
          node.attrs.value === "102112"
        ) {
          if (node.attrs.displayValue === "Bob Reporter") {
            enriched = true;
          }
        }
      });
      expect(enriched).toBe(true);
    });

    it("enriches chips after updateQuery()", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => {
        component.updateQuery("user:100");
      });

      // Wait for enrichment
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      let enriched = false;
      view.state.doc.descendants((node) => {
        if (
          node.type.name === "field-value" &&
          node.attrs.field === "user" &&
          node.attrs.value === "100"
        ) {
          if (node.attrs.displayValue === "Alice Smith") {
            enriched = true;
          }
        }
      });
      expect(enriched).toBe(true);
    });
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
