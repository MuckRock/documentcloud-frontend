import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/svelte";
import { NodeSelection, TextSelection } from "prosemirror-state";
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

    it("activates autocomplete after chip with one space", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      // Insert a chip + trailing non-breaking space, matching real browser
      // contenteditable behavior where &nbsp; prevents whitespace collapsing.
      const chipNode = view.state.schema.nodes["field-value"].create({
        field: "user",
        value: "100",
        prefix: null,
        quoted: false,
        displayValue: null,
      });
      let tr = view.state.tr;
      tr.replaceWith(1, 1, chipNode);
      const afterChip = 1 + chipNode.nodeSize;
      tr.insertText("\u00A0", afterChip);
      tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));
      view.dispatch(tr);

      // Type a field prefix
      await act(() => typeInEditor(view, "acc"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");
      expect(state.suggestions.some((s) => s.value === "access")).toBe(true);
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

  describe("range autocomplete", () => {
    it("selecting created_at from field suggestions enters range stage", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      // Type to get created_at suggestion
      await act(() => typeInEditor(view, "created"));

      let state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");
      expect(state.suggestions.some((s) => s.value === "created_at")).toBe(true);

      // Select created_at with Enter
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("range");
      expect(state.fieldName).toBe("created_at");
    });

    it("replaces typed text with field name on range field selection", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "creat"));
      // "creat" is in the editor
      expect(view.state.doc.textContent).toContain("creat");

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // The partial text should be replaced with the full field name
      expect(view.state.doc.textContent).toBe("created_at:");
    });

    it("range stage shows shortcuts as suggestions", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      const state = getACState(view);
      expect(state.stage).toBe("range");
      expect(state.suggestions.length).toBeGreaterThan(0);
      expect(state.suggestions.some((s) => s.label === "Last week")).toBe(true);
      expect(state.suggestions.some((s) => s.label === "Last month")).toBe(true);
    });

    it("selecting a shortcut inserts a range chip", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Select the first shortcut (Last week)
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Should have a range chip in the doc
      let rangeFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "range" && node.attrs.field === "created_at") {
          expect(node.attrs.lower).toBe("NOW-7DAYS");
          expect(node.attrs.upper).toBe("*");
          rangeFound = true;
        }
      });
      expect(rangeFound).toBe(true);
    });

    it("page_count field enters range stage with no shortcuts", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "page_c"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      const state = getACState(view);
      expect(state.stage).toBe("range");
      expect(state.fieldName).toBe("page_count");
      expect(state.suggestions).toHaveLength(0);
    });

    it("Escape dismisses range stage", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });
      expect(getACState(view).stage).toBe("range");

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
      expect(getACState(view).active).toBe(false);
    });

    it("arrow keys navigate range shortcuts", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).selectedIndex).toBe(0);

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
        );
      });

      expect(getACState(view).selectedIndex).toBe(1);
    });

    it("custom date range appends Solr time suffixes", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      // Find the date inputs in the dropdown and fill them
      const dropdown = document.querySelector(".search-autocomplete");
      const inputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      expect(inputs.length).toBe(3); // 1 fixed + 2 range

      // Set date values on the range inputs (skip fixed input at index 0)
      inputs[1].value = "2022-04-20";
      inputs[2].value = "2022-05-30";

      // Click the range Insert button (second one; first is the fixed section)
      const insertBtns = dropdown?.querySelectorAll(".search-ac-insert-btn") as NodeListOf<HTMLButtonElement>;
      const insertBtn = insertBtns[1];
      await act(() => {
        insertBtn.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      // The range chip should have Solr-compatible dates
      let rangeFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "range" && node.attrs.field === "created_at") {
          expect(node.attrs.lower).toBe("2022-04-20T00:00:00Z");
          expect(node.attrs.upper).toBe("2022-05-30T23:59:59Z");
          rangeFound = true;
        }
      });
      expect(rangeFound).toBe(true);
    });

    it("Enter in date input inserts the range chip", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-autocomplete");
      const inputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      // Skip fixed input at index 0; range inputs are at 1 and 2
      inputs[1].value = "2023-01-01";
      inputs[2].value = "2023-06-30";

      // Press Enter inside the start date input (range section)
      await act(() => {
        inputs[1].dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      let rangeFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "range" && node.attrs.field === "created_at") {
          expect(node.attrs.lower).toBe("2023-01-01T00:00:00Z");
          expect(node.attrs.upper).toBe("2023-06-30T23:59:59Z");
          rangeFound = true;
        }
      });
      expect(rangeFound).toBe(true);
    });

    it("custom page_count range does not add time suffixes", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "page_c"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-autocomplete");
      const inputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

      // Skip fixed input at index 0; range inputs are at 1 and 2
      inputs[1].value = "10";
      inputs[2].value = "50";

      // Use the range Insert button (second one)
      const insertBtns = dropdown?.querySelectorAll(".search-ac-insert-btn") as NodeListOf<HTMLButtonElement>;
      const insertBtn = insertBtns[1];
      await act(() => {
        insertBtn.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      let rangeFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "range" && node.attrs.field === "page_count") {
          expect(node.attrs.lower).toBe("10");
          expect(node.attrs.upper).toBe("50");
          rangeFound = true;
        }
      });
      expect(rangeFound).toBe(true);
    });

    it("range chip inserted by shortcut has null prefix by default", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Select shortcut
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      let prefixChecked = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "range" && node.attrs.field === "created_at") {
          expect(node.attrs.prefix).toBeNull();
          prefixChecked = true;
        }
      });
      expect(prefixChecked).toBe(true);
    });

    it("fixed date value inserts a field-value chip", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      // Find the fixed value input (first input in the dropdown)
      const dropdown = document.querySelector(".search-autocomplete");
      const allInputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      // Fixed section has 1 input, range section has 2 → first is the fixed input
      const fixedInput = allInputs[0];
      fixedInput.value = "2024-01-15";

      // Click the first Insert button (fixed section)
      const insertBtns = dropdown?.querySelectorAll(".search-ac-insert-btn") as NodeListOf<HTMLButtonElement>;
      await act(() => {
        insertBtns[0].dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      let chipFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "created_at") {
          expect(node.attrs.value).toBe("2024-01-15T00:00:00Z");
          chipFound = true;
        }
      });
      expect(chipFound).toBe(true);
    });

    it("fixed numeric value inserts a field-value chip for page_count", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "page_c"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-autocomplete");
      const allInputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      const fixedInput = allInputs[0];
      fixedInput.value = "50";

      const insertBtns = dropdown?.querySelectorAll(".search-ac-insert-btn") as NodeListOf<HTMLButtonElement>;
      await act(() => {
        insertBtns[0].dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      let chipFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "page_count") {
          expect(node.attrs.value).toBe("50");
          chipFound = true;
        }
      });
      expect(chipFound).toBe(true);
    });

    it("Enter in fixed input inserts a field-value chip", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-autocomplete");
      const allInputs = dropdown?.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
      const fixedInput = allInputs[0];
      fixedInput.value = "2024-06-01";

      // Press Enter in the fixed input
      await act(() => {
        fixedInput.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      let chipFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "created_at") {
          expect(node.attrs.value).toBe("2024-06-01T00:00:00Z");
          chipFound = true;
        }
      });
      expect(chipFound).toBe(true);
    });
  });

  describe("change event", () => {
    it("does not emit change for plain text typing", async () => {
      const { component } = await renderEditor();
      const view = component.getView();
      const changeSpy = vi.fn();
      component.$on("change", changeSpy);

      await act(() => typeInEditor(view, "hello"));

      expect(changeSpy).not.toHaveBeenCalled();
    });

    it("emits change when a range chip is inserted via shortcut", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      // Type and select created_at
      await act(() => typeInEditor(view, "created"));

      // Attach spy AFTER typing, so we only observe the chip insertion
      const changeSpy = vi.fn();
      component.$on("change", changeSpy);

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Text replacement (creat → created_at:) is non-structural
      expect(changeSpy).not.toHaveBeenCalled();

      // Select the first shortcut
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Now change should fire (range chip is structural)
      expect(changeSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy.mock.calls[0][0].detail.q).toContain("created_at:");
    });
  });

  describe("chip editing (subissue 2)", () => {
    /** Find the position of the first node of a given type and select it. */
    function selectChipNode(
      view: import("prosemirror-view").EditorView,
      typeName: string,
    ) {
      let chipPos: number | null = null;
      view.state.doc.descendants((node, pos) => {
        if (chipPos === null && node.type.name === typeName) {
          chipPos = pos;
        }
      });
      if (chipPos === null) throw new Error(`No ${typeName} node found`);
      const tr = view.state.tr.setSelection(
        NodeSelection.create(view.state.doc, chipPos),
      );
      view.dispatch(tr);
    }

    it("clicking a sort chip toggles its direction", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "sort:created_at",
      });
      const view = component.getView();

      // Verify initial direction is asc
      let sortNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "sort") sortNode = node;
      });
      expect(sortNode!.attrs.direction).toBe("asc");

      // Click the sort chip
      const sortChip = editor.querySelector(".search-sort") as HTMLElement;
      expect(sortChip).toBeInTheDocument();
      await act(() => {
        sortChip.closest(".search-nodeview")!.dispatchEvent(
          new MouseEvent("click", { bubbles: true }),
        );
      });

      // Direction should now be desc
      sortNode = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "sort") sortNode = node;
      });
      expect(sortNode!.attrs.direction).toBe("desc");

      // Serialization reflects the change
      expect(component.getQuery()).toBe("sort:-created_at");
    });

    it("clicking a sort chip twice toggles back to asc", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "sort:-created_at",
      });
      const view = component.getView();
      const nodeview = editor.querySelector(".search-sort")!.closest(".search-nodeview")!;

      await act(() => {
        nodeview.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });

      let sortNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "sort") sortNode = node;
      });
      expect(sortNode!.attrs.direction).toBe("asc");
      expect(component.getQuery()).toBe("sort:created_at");
    });

    it("selecting a field-value chip opens the chip editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      const popover = document.querySelector(".chip-editor");
      expect(popover).not.toBeNull();
      expect(popover!.getAttribute("role")).toBe("dialog");
    });

    it("selecting a range chip opens the chip editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "range"));

      const popover = document.querySelector(".chip-editor");
      expect(popover).not.toBeNull();
    });

    it("deselecting a chip closes the popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      // Select chip → popover opens
      await act(() => selectChipNode(view, "field-value"));
      expect(document.querySelector(".chip-editor")).not.toBeNull();

      // Move cursor to text → chip deselected → popover closes
      await act(() => {
        const tr = view.state.tr.setSelection(
          TextSelection.create(view.state.doc, view.state.doc.content.size - 1),
        );
        view.dispatch(tr);
      });
      expect(document.querySelector(".chip-editor")).toBeNull();
    });

    it("toggling Require in the popover updates the chip prefix", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      // Click Require toggle
      const requiredBtn = document.querySelector(
        ".chip-editor-toggle[title='Require (+)']",
      ) as HTMLElement;
      expect(requiredBtn).not.toBeNull();
      await act(() => {
        requiredBtn.click();
      });

      // Chip should now have prefix "+"
      let chipNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") chipNode = node;
      });
      expect(chipNode!.attrs.prefix).toBe("+");
      expect(component.getQuery()).toBe("+access:public");
    });

    it("toggling Exclude in the popover updates the chip prefix", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      const excludedBtn = document.querySelector(
        ".chip-editor-toggle[title='Exclude (-)']",
      ) as HTMLElement;
      await act(() => {
        excludedBtn.click();
      });

      expect(component.getQuery()).toBe("-access:public");
    });

    it("toggling Require when already required removes the prefix", async () => {
      const { component } = await renderEditor({
        initialQuery: "+access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      const requiredBtn = document.querySelector(
        ".chip-editor-toggle[title='Require (+)']",
      ) as HTMLElement;
      await act(() => {
        requiredBtn.click();
      });

      expect(component.getQuery()).toBe("access:public");
    });

    it("deleting a chip via the popover removes it from the document", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      const deleteBtn = document.querySelector(".chip-editor-delete") as HTMLElement;
      expect(deleteBtn).not.toBeNull();
      await act(() => {
        deleteBtn.click();
      });

      // Chip should be gone, popover should be closed
      expect(document.querySelector(".chip-editor")).toBeNull();
      expect(editor.querySelectorAll(".search-field-value").length).toBe(0);
      expect(component.getQuery()).toContain("report");
    });

    it("Escape closes the chip editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));
      expect(document.querySelector(".chip-editor")).not.toBeNull();

      // Press Escape on the popover
      const popover = document.querySelector(".chip-editor") as HTMLElement;
      await act(() => {
        popover.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });

      expect(document.querySelector(".chip-editor")).toBeNull();
    });

    it("boost stepper increments and decrements on field-value chips", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "field-value"));

      // Increment boost
      let incrementBtn = document.querySelector(
        "[aria-label='Increase boost']",
      ) as HTMLElement;
      await act(() => {
        incrementBtn.click();
      });

      let chipNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") chipNode = node;
      });
      expect(chipNode!.attrs.boost).toBe(2);

      // Increment again (re-query in case popover was recreated)
      incrementBtn = document.querySelector(
        "[aria-label='Increase boost']",
      ) as HTMLElement;
      await act(() => {
        incrementBtn.click();
      });

      chipNode = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") chipNode = node;
      });
      expect(chipNode!.attrs.boost).toBe(3);

      // Decrement (re-query)
      const decrementBtn = document.querySelector(
        "[aria-label='Decrease boost']",
      ) as HTMLElement;
      await act(() => {
        decrementBtn.click();
      });

      chipNode = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") chipNode = node;
      });
      expect(chipNode!.attrs.boost).toBe(2);
    });

    it("range chip editor does not show boost controls", async () => {
      const { component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const view = component.getView();

      await act(() => selectChipNode(view, "range"));

      // Should not have boost controls
      expect(document.querySelector("[aria-label='Increase boost']")).toBeNull();
      expect(document.querySelector("[aria-label='Decrease boost']")).toBeNull();
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
