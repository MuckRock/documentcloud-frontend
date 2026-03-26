import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import { autocompletePluginKey } from "../autocomplete.svelte";
import { AutocompleteViewController } from "../autocomplete-view-controller.svelte";
import { searchSchema } from "../../schema";
import { autocompletePlugin } from "../autocomplete.svelte";

// Mock Svelte mount/unmount
const mockGetElement = vi.fn(() => {
  const el = document.createElement("div");
  return el;
});
vi.mock("svelte", () => ({
  mount: vi.fn(() => ({ getElement: mockGetElement })),
  unmount: vi.fn(),
  flushSync: vi.fn((fn: () => void) => fn()),
}));

// Mock the Svelte components
vi.mock("../../../AutocompleteDropdown.svelte", () => ({ default: {} }));
vi.mock("../../../RangeBuilder.svelte", () => ({ default: {} }));

// Mock floating-ui
vi.mock("@floating-ui/dom", () => ({
  computePosition: vi.fn().mockResolvedValue({ x: 0, y: 0 }),
  flip: vi.fn(),
  offset: vi.fn(),
  shift: vi.fn(),
}));

// Mock API modules (required by autocomplete-data)
vi.mock("$lib/api/accounts", () => ({
  listUsers: vi.fn().mockResolvedValue({ data: { results: [] } }),
  listOrgs: vi.fn().mockResolvedValue({ data: { results: [] } }),
}));
vi.mock("$lib/api/projects", () => ({
  list: vi.fn().mockResolvedValue({ data: { results: [] } }),
}));
vi.mock("$lib/api/documents", () => ({
  search: vi.fn().mockResolvedValue({ data: { results: [] } }),
}));

// jsdom doesn't implement elementFromPoint, which ProseMirror calls on mousedown
document.elementFromPoint = vi.fn().mockReturnValue(null);

function createEditorView(): EditorView {
  const plugin = autocompletePlugin();
  const state = EditorState.create({
    schema: searchSchema,
    plugins: [plugin],
  });
  const container = document.createElement("div");
  document.body.appendChild(container);
  return new EditorView(container, { state });
}

describe("AutocompleteViewController", () => {
  let view: EditorView;
  let vc: AutocompleteViewController;

  beforeEach(() => {
    view = createEditorView();
    vc = new AutocompleteViewController(view, {});
  });

  afterEach(() => {
    vc.destroy();
    view.dom.parentElement?.remove();
    view.destroy();
  });

  describe("lifecycle", () => {
    it("creates DOM containers on construction", () => {
      // The constructor appends 3 elements to document.body:
      // dropdownContainer, rangeContainer, liveRegion
      const liveRegion = document.body.querySelector("[aria-live='polite']");
      expect(liveRegion).not.toBeNull();
      expect(liveRegion?.getAttribute("aria-atomic")).toBe("true");
    });

    it("removes DOM containers on destroy", () => {
      const liveRegionsBefore = document.body.querySelectorAll(
        "[aria-live='polite']",
      ).length;
      vc.destroy();
      const liveRegionsAfter = document.body.querySelectorAll(
        "[aria-live='polite']",
      ).length;
      expect(liveRegionsAfter).toBe(liveRegionsBefore - 1);
    });
  });

  describe("ARIA management", () => {
    it("sets aria-autocomplete on editor DOM", () => {
      expect(view.dom.getAttribute("aria-autocomplete")).toBe("list");
    });

    it("sets aria-expanded to false initially", () => {
      expect(view.dom.getAttribute("aria-expanded")).toBe("false");
    });

    it("sets aria-controls to the dropdown id", () => {
      const controls = view.dom.getAttribute("aria-controls");
      expect(controls).toMatch(/^search-ac-\d+$/);
    });

    it("removes ARIA attributes on destroy", () => {
      vc.destroy();
      expect(view.dom.getAttribute("aria-autocomplete")).toBeNull();
      expect(view.dom.getAttribute("aria-expanded")).toBeNull();
      expect(view.dom.getAttribute("aria-controls")).toBeNull();
      expect(view.dom.getAttribute("aria-activedescendant")).toBeNull();
    });
  });

  describe("click-away dismissal", () => {
    it("dispatches DISMISSED on mousedown outside editor", () => {
      // Set autocomplete plugin state via transaction metadata for test setup
      const tr = view.state.tr.setMeta(autocompletePluginKey, {
        active: true,
        dismissed: false,
        loading: false,
        stage: "field",
        fieldName: null,
        from: 1,
        to: 1,
        filterText: "",
        suggestions: [{ label: "Access", value: "access" }],
        selectedIndex: 0,
      });
      view.dispatch(tr);

      // Click outside
      const outsideEl = document.createElement("div");
      document.body.appendChild(outsideEl);
      const event = new MouseEvent("mousedown", { bubbles: true });
      outsideEl.dispatchEvent(event);
      outsideEl.remove();

      // Read the autocomplete plugin's state to verify it was dismissed
      const state = autocompletePluginKey.getState(view.state);
      expect(state?.dismissed).toBe(true);
    });

    it("does not dismiss on mousedown inside editor", () => {
      // Activate autocomplete
      const tr = view.state.tr.setMeta(autocompletePluginKey, {
        active: true,
        dismissed: false,
        loading: false,
        stage: "field",
        fieldName: null,
        from: 1,
        to: 1,
        filterText: "",
        suggestions: [{ label: "Access", value: "access" }],
        selectedIndex: 0,
      });
      view.dispatch(tr);

      // Click inside editor
      const event = new MouseEvent("mousedown", { bubbles: true });
      view.dom.dispatchEvent(event);

      const state = autocompletePluginKey.getState(view.state);
      expect(state?.active).toBe(true);
      expect(state?.dismissed).toBe(false);
    });
  });

  describe("blur dismissal", () => {
    it("dispatches DISMISSED on editor blur after timeout", async () => {
      // Activate autocomplete
      const tr = view.state.tr.setMeta(autocompletePluginKey, {
        active: true,
        dismissed: false,
        loading: false,
        stage: "field",
        fieldName: null,
        from: 1,
        to: 1,
        filterText: "",
        suggestions: [{ label: "Access", value: "access" }],
        selectedIndex: 0,
      });
      view.dispatch(tr);

      // Trigger blur
      vi.useFakeTimers();
      view.dom.dispatchEvent(new Event("blur"));
      vi.advanceTimersByTime(150);

      const state = autocompletePluginKey.getState(view.state);
      expect(state?.dismissed).toBe(true);
      vi.useRealTimers();
    });
  });

  describe("update", () => {
    it("sets aria-expanded to false when inactive", () => {
      vc.update(view);
      expect(view.dom.getAttribute("aria-expanded")).toBe("false");
    });

    it("sets aria-expanded to true when active with field suggestions", () => {
      // Type text into the editor to trigger autocomplete detection
      const tr = view.state.tr.insertText("acc");
      view.dispatch(tr);
      // Call update to trigger re-computation — the text "acc" triggers field autocomplete
      vc.update(view);

      // After the re-compute dispatches, update again to render
      vc.update(view);

      expect(view.dom.getAttribute("aria-expanded")).toBe("true");
    });

    it("sets aria-activedescendant when active with field suggestions", () => {
      // Insert text so computeAutocompleteState finds a trigger
      const tr = view.state.tr.insertText("acc");
      view.dispatch(tr);
      vc.update(view);
      vc.update(view);

      const activeDesc = view.dom.getAttribute("aria-activedescendant");
      expect(activeDesc).not.toBeNull();
      expect(activeDesc!).toMatch(/^search-ac-\d+-opt-0$/);
    });
  });
});
