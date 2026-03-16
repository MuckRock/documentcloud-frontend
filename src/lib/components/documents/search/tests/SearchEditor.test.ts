import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/svelte";
import { NodeSelection, TextSelection } from "prosemirror-state";
import SearchEditor from "../SearchEditor.svelte";
import { autocompletePluginKey } from "../prosemirror/plugins/autocomplete.svelte";

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
      results: [{ id: 200, name: "Acme Corp" }],
    },
  }),
}));

vi.mock("$lib/api/projects", () => ({
  list: vi.fn().mockResolvedValue({
    data: {
      results: [{ id: 300, title: "Project Alpha" }],
    },
  }),
}));

vi.mock("$lib/api/documents", () => ({
  search: vi.fn().mockResolvedValue({
    data: {
      results: [{ id: 400, title: "Test Document" }],
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
function typeInEditor(
  view: import("prosemirror-view").EditorView,
  text: string,
) {
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
    const submitSpy = vi.fn();
    await renderEditor({
      initialQuery: "mueller report",
      onsubmit: submitSpy,
    });

    const button = screen.getByRole<HTMLButtonElement>("button", {
      name: /search/i,
    });
    await act(() => {
      button.click();
    });

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy.mock.calls[0]?.[0]).toEqual({
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

    it("activates autocomplete after atom with one space", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      // Insert an atom + trailing non-breaking space, matching real browser
      // contenteditable behavior where &nbsp; prevents whitespace collapsing.
      const atomNode = view.state.schema.nodes["field-value"]!.create({
        field: "user",
        value: "100",
        prefix: null,
        quoted: false,
        displayValue: null,
      });
      let tr = view.state.tr;
      tr.replaceWith(1, 1, atomNode);
      const afterChip = 1 + atomNode.nodeSize;
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
      expect(state.suggestions.some((s) => s.label === "Alice Smith")).toBe(
        true,
      );
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

      // The atom should have displayValue set
      const doc = view.state.doc;
      let atomFound = false;
      doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "user") {
          expect(node.attrs.displayValue).toBe("Alice Smith");
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });
  });

  describe("atom enrichment (Phase 6)", () => {
    it("enriches atoms with display names on initial load", async () => {
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

    it("enriches atoms after updateQuery()", async () => {
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
      expect(state.suggestions.some((s) => s.value === "created_at")).toBe(
        true,
      );

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
      expect(state.suggestions.some((s) => s.label === "Last month")).toBe(
        true,
      );
    });

    it("selecting a shortcut inserts a range atom", async () => {
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

      // Should have a range atom in the doc
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

      // Find the date inputs in the range builder dropdown
      const dropdown = document.querySelector(".search-ac-range");
      const inputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;
      expect(inputs.length).toBe(3); // 1 fixed + 2 range

      // Set date values on the range inputs (skip fixed input at index 0)
      inputs[1]!.value = "2022-04-20";
      inputs[2]!.value = "2022-05-30";

      // Click the range Insert button (second one; first is the fixed section)
      const insertBtns = dropdown?.querySelectorAll(
        ".search-ac-insert-btn",
      ) as NodeListOf<HTMLButtonElement>;
      const insertBtn = insertBtns[1];
      await act(() => {
        insertBtn?.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      // The range atom should have Solr-compatible dates
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

    it("Enter in date input inserts the range atom", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-ac-range");
      const inputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;
      // Skip fixed input at index 0; range inputs are at 1 and 2
      inputs[1]!.value = "2023-01-01";
      inputs[2]!.value = "2023-06-30";

      // Press Enter inside the start date input (range section)
      await act(() => {
        inputs[1]?.dispatchEvent(
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

      const dropdown = document.querySelector(".search-ac-range");
      const inputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;

      // Skip fixed input at index 0; range inputs are at 1 and 2
      inputs[1]!.value = "10";
      inputs[2]!.value = "50";

      // Use the range Insert button (second one)
      const insertBtns = dropdown?.querySelectorAll(
        ".search-ac-insert-btn",
      ) as NodeListOf<HTMLButtonElement>;
      const insertBtn = insertBtns[1];
      await act(() => {
        insertBtn?.dispatchEvent(
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

    it("range atom inserted by shortcut has null prefix by default", async () => {
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

    it("fixed date value inserts a field-value atom", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      // Find the fixed value input (first input in the range builder)
      const dropdown = document.querySelector(".search-ac-range");
      const allInputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;
      // Fixed section has 1 input, range section has 2 → first is the fixed input
      const fixedInput = allInputs[0];
      fixedInput!.value = "2024-01-15";

      // Click the first Insert button (fixed section)
      const insertBtns = dropdown?.querySelectorAll(
        ".search-ac-insert-btn",
      ) as NodeListOf<HTMLButtonElement>;
      await act(() => {
        insertBtns[0]?.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (
          node.type.name === "field-value" &&
          node.attrs.field === "created_at"
        ) {
          expect(node.attrs.value).toBe("2024-01-15T00:00:00Z");
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });

    it("fixed numeric value inserts a field-value atom for page_count", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "page_c"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-ac-range");
      const allInputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;
      const fixedInput = allInputs[0];
      fixedInput!.value = "50";

      const insertBtns = dropdown?.querySelectorAll(
        ".search-ac-insert-btn",
      ) as NodeListOf<HTMLButtonElement>;
      await act(() => {
        insertBtns[0]?.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (
          node.type.name === "field-value" &&
          node.attrs.field === "page_count"
        ) {
          expect(node.attrs.value).toBe("50");
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });

    it("Enter in fixed input inserts a field-value atom", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "created"));
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(getACState(view).stage).toBe("range");

      const dropdown = document.querySelector(".search-ac-range");
      const allInputs = dropdown?.querySelectorAll(
        "input",
      ) as NodeListOf<HTMLInputElement>;
      const fixedInput = allInputs[0];
      fixedInput!.value = "2024-06-01";

      // Press Enter in the fixed input
      await act(() => {
        fixedInput?.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (
          node.type.name === "field-value" &&
          node.attrs.field === "created_at"
        ) {
          expect(node.attrs.value).toBe("2024-06-01T00:00:00Z");
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });
  });

  describe("change event", () => {
    it("does not emit change for plain text typing", async () => {
      const changeSpy = vi.fn();
      const { component } = await renderEditor({ onchange: changeSpy });
      const view = component.getView();

      await act(() => typeInEditor(view, "hello"));

      expect(changeSpy).not.toHaveBeenCalled();
    });

    it("emits change when a range atom is inserted via shortcut", async () => {
      const changeSpy = vi.fn();
      const { component, editor } = await renderEditor({ onchange: changeSpy });
      const view = component.getView();

      // Type and select created_at
      await act(() => typeInEditor(view, "created"));

      // changeSpy is already attached via props; reset call count
      changeSpy.mockClear();

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

      // Now change should fire (range atom is structural)
      expect(changeSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy.mock.calls[0]?.[0].q).toContain("created_at:");
    });
  });

  describe("atom editing (subissue 2)", () => {
    /** Find the position of the first node of a given type and select it. */
    function selectAtomNode(
      view: import("prosemirror-view").EditorView,
      typeName: string,
    ) {
      let atomPos: number | null = null;
      view.state.doc.descendants((node, pos) => {
        if (atomPos === null && node.type.name === typeName) {
          atomPos = pos;
        }
      });
      if (atomPos === null) throw new Error(`No ${typeName} node found`);
      const tr = view.state.tr.setSelection(
        NodeSelection.create(view.state.doc, atomPos),
      );
      view.dispatch(tr);
    }

    it("clicking a sort atom toggles its direction", async () => {
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

      // Click the sort atom
      const sortChip = editor.querySelector(".search-sort") as HTMLElement;
      expect(sortChip).toBeInTheDocument();
      await act(() => {
        sortChip
          .closest(".search-nodeview")!
          .dispatchEvent(new MouseEvent("click", { bubbles: true }));
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

    it("clicking a sort atom twice toggles back to asc", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "sort:-created_at",
      });
      const view = component.getView();
      const nodeview = editor
        .querySelector(".search-sort")!
        .closest(".search-nodeview")!;

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

    it("selecting a field-value atom opens the atom editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));

      const popover = document.querySelector(".atom-editor");
      expect(popover).not.toBeNull();
      expect(popover!.getAttribute("role")).toBe("dialog");
    });

    it("selecting a range atom opens the atom editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "range"));

      const popover = document.querySelector(".atom-editor");
      expect(popover).not.toBeNull();
    });

    it("deselecting an atom closes the popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      // Select atom → popover opens
      await act(() => selectAtomNode(view, "field-value"));
      expect(document.querySelector(".atom-editor")).not.toBeNull();

      // Move cursor to text → atom deselected → popover closes
      await act(() => {
        const tr = view.state.tr.setSelection(
          TextSelection.create(view.state.doc, view.state.doc.content.size - 1),
        );
        view.dispatch(tr);
      });
      expect(document.querySelector(".atom-editor")).toBeNull();
    });

    it("toggling Require in the popover updates the atom prefix", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));

      // Click Require toggle
      const requiredBtn = document.querySelector(
        ".atom-editor button[title='Require']",
      ) as HTMLElement;
      expect(requiredBtn).not.toBeNull();
      await act(() => {
        requiredBtn.click();
      });

      // Atom should now have prefix "+"
      let atomNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomNode = node;
      });
      expect(atomNode!.attrs.prefix).toBe("+");
      expect(component.getQuery()).toBe("+access:public");
    });

    it("toggling Exclude in the popover updates the atom prefix", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));

      const excludedBtn = document.querySelector(
        ".atom-editor button[title='Exclude']",
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

      await act(() => selectAtomNode(view, "field-value"));

      const requiredBtn = document.querySelector(
        ".atom-editor button[title='Require']",
      ) as HTMLElement;
      await act(() => {
        requiredBtn.click();
      });

      expect(component.getQuery()).toBe("access:public");
    });

    it("deleting an atom via the popover removes it from the document", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));

      // The delete button is a <Button> component rendered inside the popover
      const popover = document.querySelector(".atom-editor") as HTMLElement;
      const deleteBtn = popover?.querySelector("button.danger") as HTMLElement;
      expect(deleteBtn).not.toBeNull();
      await act(() => {
        deleteBtn.click();
      });

      // Atom should be gone, popover should be closed
      expect(document.querySelector(".atom-editor")).toBeNull();
      expect(editor.querySelectorAll(".search-field-value").length).toBe(0);
      expect(component.getQuery()).toContain("report");
    });

    it("Escape closes the atom editor popover", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));
      expect(document.querySelector(".atom-editor")).not.toBeNull();

      // Press Escape on the popover
      const popover = document.querySelector(".atom-editor") as HTMLElement;
      await act(() => {
        popover.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });

      expect(document.querySelector(".atom-editor")).toBeNull();
    });

    it("boost stepper increments and decrements on field-value atoms", async () => {
      const { component } = await renderEditor({
        initialQuery: "access:public",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "field-value"));

      // Increment boost
      let incrementBtn = document.querySelector(
        "[aria-label='Increase boost']",
      ) as HTMLElement;
      await act(() => {
        incrementBtn.click();
      });

      let atomNode: import("prosemirror-model").Node | null = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomNode = node;
      });
      expect(atomNode!.attrs.boost).toBe(2);

      // Increment again (re-query in case popover was recreated)
      incrementBtn = document.querySelector(
        "[aria-label='Increase boost']",
      ) as HTMLElement;
      await act(() => {
        incrementBtn.click();
      });

      atomNode = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomNode = node;
      });
      expect(atomNode!.attrs.boost).toBe(3);

      // Decrement (re-query)
      const decrementBtn = document.querySelector(
        "[aria-label='Decrease boost']",
      ) as HTMLElement;
      await act(() => {
        decrementBtn.click();
      });

      atomNode = null;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomNode = node;
      });
      expect(atomNode!.attrs.boost).toBe(2);
    });

    it("range atom editor does not show boost controls", async () => {
      const { component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const view = component.getView();

      await act(() => selectAtomNode(view, "range"));

      // Should not have boost controls
      expect(
        document.querySelector("[aria-label='Increase boost']"),
      ).toBeNull();
      expect(
        document.querySelector("[aria-label='Decrease boost']"),
      ).toBeNull();
    });
  });

  describe("deserialization on load (Phase 4)", () => {
    it("deserializes initialQuery with field-value into atoms", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "user:102112 AND access:private",
      });
      // Should have atoms rendered
      const atoms = editor.querySelectorAll(".search-field-value");
      expect(atoms.length).toBe(2);
      // Serialization should round-trip
      expect(component.getQuery()).toBe("user:102112 AND access:private");
    });

    it("deserializes initialQuery with sort into atom", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "sort:-created_at",
      });
      const sortChip = editor.querySelector(".search-sort");
      expect(sortChip).toBeInTheDocument();
      expect(component.getQuery()).toBe("sort:-created_at");
    });

    it("deserializes initialQuery with range into atom", async () => {
      const { editor, component } = await renderEditor({
        initialQuery: "created_at:[NOW-1MONTH TO *]",
      });
      const rangeChip = editor.querySelector(".search-range");
      expect(rangeChip).toBeInTheDocument();
      expect(component.getQuery()).toBe("created_at:[NOW-1MONTH TO *]");
    });

    it("deserializes complex mixed query with atoms and text", async () => {
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
      // Should not create an atom for title
      const atoms = editor.querySelectorAll(".search-field-value");
      expect(atoms.length).toBe(0);
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

  describe("autocomplete insertion flow", () => {
    it("full flow: type field prefix → select field → select value → atom inserted", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      // Type "acc" to trigger field suggestions
      await act(() => typeInEditor(view, "acc"));
      let state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");

      // Select "access" with Enter
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Should now be in value stage
      state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("value");
      expect(state.fieldName).toBe("access");

      // Select first value ("public") with Enter
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      // Atom should be inserted
      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "access") {
          expect(node.attrs.value).toBe("public");
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });

    it("full flow: sort field → select sort option → sort atom inserted", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "sort:"));

      let state = getACState(view);
      expect(state.stage).toBe("value");
      expect(state.fieldName).toBe("sort");

      // Navigate to "Created (newest)" — sort:-created_at
      // Find the index for created_at desc
      const descIdx = state.suggestions.findIndex(
        (s) => s.value === "-created_at",
      );
      // Navigate to it
      for (let i = 0; i < descIdx; i++) {
        await act(() => {
          editor.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
          );
        });
      }

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      let sortFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "sort") {
          expect(node.attrs.field).toBe("created_at");
          expect(node.attrs.direction).toBe("desc");
          sortFound = true;
        }
      });
      expect(sortFound).toBe(true);
    });
  });

  describe("keyboard navigation in autocomplete", () => {
    it("ArrowDown cycles through suggestions and wraps", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));
      const state = getACState(view);
      const count = state.suggestions.length;
      expect(state.selectedIndex).toBe(0);

      // Navigate down through all suggestions
      for (let i = 1; i <= count; i++) {
        await act(() => {
          editor.dispatchEvent(
            new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
          );
        });
        expect(getACState(view).selectedIndex).toBe(i % count);
      }
      // After wrapping, should be back at 0
      expect(getACState(view).selectedIndex).toBe(0);
    });

    it("ArrowUp cycles in reverse and wraps", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));
      const count = getACState(view).suggestions.length;
      expect(getACState(view).selectedIndex).toBe(0);

      // ArrowUp from 0 should wrap to last
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
        );
      });
      expect(getACState(view).selectedIndex).toBe(count - 1);
    });

    it("Tab selects the highlighted suggestion", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "access:"));
      expect(getACState(view).stage).toBe("value");

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
        );
      });

      // Should have inserted an atom
      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value" && node.attrs.field === "access") {
          atomFound = true;
        }
      });
      expect(atomFound).toBe(true);
    });

    it("Escape dismisses dropdown and sets aria-expanded to false", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));
      expect(editor.getAttribute("aria-expanded")).toBe("true");

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });

      expect(getACState(view).active).toBe(false);
      expect(editor.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("Mod+/ shortcut", () => {
    it("opens full field list in empty editor", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "/",
            metaKey: true,
            bubbles: true,
          }),
        );
      });

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");
      // Should show all fields (not filtered)
      expect(state.suggestions.length).toBeGreaterThan(5);
    });

    it("opens full field list with cursor after text", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "hello "));

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "/",
            metaKey: true,
            bubbles: true,
          }),
        );
      });

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.stage).toBe("field");
      expect(state.suggestions.length).toBeGreaterThan(5);
    });

    it("Escape after Mod+/ closes dropdown", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "/",
            metaKey: true,
            bubbles: true,
          }),
        );
      });
      expect(getACState(view).active).toBe(true);

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
      expect(getACState(view).active).toBe(false);
    });
  });

  describe("atom keyboard interaction", () => {
    it("Backspace deletes a selected atom", async () => {
      const { component, editor } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      // Select the atom via NodeSelection
      let atomPos: number | null = null;
      view.state.doc.descendants((node, pos) => {
        if (atomPos === null && node.type.name === "field-value") {
          atomPos = pos;
        }
      });
      expect(atomPos).not.toBeNull();

      await act(() => {
        const tr = view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, atomPos!),
        );
        view.dispatch(tr);
      });

      // Verify it's selected
      expect(view.state.selection instanceof NodeSelection).toBe(true);

      // Press Backspace
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
        );
      });

      // Atom should be gone
      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomFound = true;
      });
      expect(atomFound).toBe(false);
      expect(component.getQuery()).toContain("report");
    });

    it("Delete key deletes a selected atom", async () => {
      const { component, editor } = await renderEditor({
        initialQuery: "access:public report",
      });
      const view = component.getView();

      let atomPos: number | null = null;
      view.state.doc.descendants((node, pos) => {
        if (atomPos === null && node.type.name === "field-value") {
          atomPos = pos;
        }
      });

      await act(() => {
        const tr = view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, atomPos!),
        );
        view.dispatch(tr);
      });

      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Delete", bubbles: true }),
        );
      });

      let atomFound = false;
      view.state.doc.descendants((node) => {
        if (node.type.name === "field-value") atomFound = true;
      });
      expect(atomFound).toBe(false);
    });
  });

  describe("live region announcements", () => {
    it("announces suggestion count when autocomplete activates", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));

      const state = getACState(view);
      const count = state.suggestions.length;

      // Find the plugin's live region (appended to document.body)
      const liveRegions = document.querySelectorAll("[aria-live='polite']");
      const liveRegion = Array.from(liveRegions).find((el) =>
        el.textContent?.includes("suggestion"),
      );
      expect(liveRegion).toBeTruthy();
      expect(liveRegion!.textContent).toContain(`${count} suggestion`);
    });

    it("clears live region when autocomplete dismisses", async () => {
      const { component, editor } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "acc"));

      // Find the live region
      const liveRegions = document.querySelectorAll("[aria-live='polite']");
      const liveRegion = Array.from(liveRegions).find((el) =>
        el.textContent?.includes("suggestion"),
      );
      expect(liveRegion).toBeTruthy();

      // Dismiss
      await act(() => {
        editor.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });

      expect(liveRegion!.textContent).toBe("");
    });
  });

  describe("edge cases", () => {
    it("exact field name match still shows suggestions", async () => {
      const { component } = await renderEditor();
      const view = component.getView();

      await act(() => typeInEditor(view, "access"));

      const state = getACState(view);
      expect(state.active).toBe(true);
      expect(state.suggestions.some((s) => s.value === "access")).toBe(true);
    });
  });
});
