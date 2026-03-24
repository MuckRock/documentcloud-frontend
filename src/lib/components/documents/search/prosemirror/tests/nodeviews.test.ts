import { describe, it, expect, vi } from "vitest";
import { render, act } from "@testing-library/svelte";
import { NodeSelection, TextSelection } from "prosemirror-state";
import SearchEditor from "../../tests/SearchEditor.demo.svelte";
import { searchSchema } from "../schema";

/** Render the editor and wait for ProseMirror to initialize */
async function renderEditor(props: Record<string, unknown> = {}) {
  const result = render(SearchEditor, { props });
  await act();
  const editor = result.container.querySelector(".ProseMirror") as HTMLElement;
  return { ...result, editor };
}

/** Helper to programmatically insert a node into the editor */
function insertNode(
  component: any,
  nodeType: string,
  attrs: Record<string, unknown>,
) {
  const view = component.getView();
  const node = searchSchema.nodes[nodeType]?.create(attrs);
  // Insert the atom node at the current cursor position
  const tr = view.state.tr.replaceSelectionWith(node);
  view.dispatch(tr);
}

describe("NodeViews in SearchEditor", () => {
  describe("field-value atom rendering", () => {
    it("renders a field-value node as an atom in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const atom = editor.querySelector(".search-field-value");
      expect(atom).toBeInTheDocument();
      expect(atom?.textContent).toContain("user");
      expect(atom?.textContent).toContain("102112");
    });

    it("renders a field-value atom with displayValue", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          displayValue: "Mitchell Kotler",
        });
      });
      const atom = editor.querySelector(".search-field-value");
      expect(atom?.textContent).toContain("Mitchell Kotler");
    });

    it("renders a field-value atom with prefix", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          prefix: "+",
        });
      });
      const prefix = editor.querySelector(".atom-prefix-required");
      expect(prefix).toBeInTheDocument();
    });
  });

  describe("range atom rendering", () => {
    it("renders a range node as an atom in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "range", {
          field: "created_at",
          lower: "NOW-1MONTH",
          upper: "*",
        });
      });
      const atom = editor.querySelector(".search-range");
      expect(atom).toBeInTheDocument();
      expect(atom?.textContent).toContain("created_at");
    });
  });

  describe("sort atom rendering", () => {
    it("renders a sort node as an atom in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "sort", {
          field: "page_count",
          direction: "desc",
        });
      });
      const atom = editor.querySelector(".search-sort");
      expect(atom).toBeInTheDocument();
      expect(atom?.textContent).toContain("page_count");
      expect(atom?.textContent).toContain("\u2193"); // ↓
    });
  });

  describe("serialization still works with NodeViews", () => {
    it("serializes field-value atom correctly", async () => {
      const { component } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          prefix: "+",
        });
      });
      expect(component.getQuery()).toBe("+user:102112");
    });

    it("serializes mixed content with atoms and text", async () => {
      const { component } = await renderEditor();
      await act(() => {
        const view = component.getView();
        const nodes = [
          searchSchema.nodes["field-value"].create({
            field: "user",
            value: "102112",
            prefix: "+",
          }),
          searchSchema.text(" AND "),
          searchSchema.nodes["field-value"].create({
            field: "access",
            value: "private",
          }),
        ];
        // Replace a range with multiple nodes (atoms + text)
        const tr = view.state.tr.replaceWith(
          1, // start of paragraph content
          1, // end (empty paragraph)
          nodes,
        );
        view.dispatch(tr);
      });
      expect(component.getQuery()).toBe("+user:102112 AND access:private");
    });
  });

  describe("entity enrichment through NodeViews", () => {
    it("shows raw value and loading indicator when displayValue is not set for entity fields", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const atom = editor.querySelector(".search-field-value");
      expect(atom?.textContent).toContain("102112");
      // Loading indicator should be visible for entity fields without displayValue
      const loading = editor.querySelector(".atom-loading");
      expect(loading).toBeInTheDocument();
    });

    it("updates atom when displayValue is set via transaction", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });

      // Now simulate enrichment: find the node and update its displayValue
      await act(() => {
        const view = component.getView();
        const { doc } = view.state;
        let nodePos: number | null = null;
        // Walk the doc tree to find the atom's position
        doc.descendants((node, pos) => {
          if (
            node.type.name === "field-value" &&
            node.attrs.field === "user" &&
            node.attrs.value === "102112"
          ) {
            nodePos = pos;
            return false;
          }
        });
        expect(nodePos).not.toBeNull();
        // Update the node's attributes in place without replacing it
        const tr = view.state.tr.setNodeMarkup(nodePos!, undefined, {
          ...view.state.doc.nodeAt(nodePos!)!.attrs,
          displayValue: "Mitchell Kotler",
        });
        view.dispatch(tr);
      });

      const atom = editor.querySelector(".search-field-value");
      expect(atom?.textContent).toContain("Mitchell Kotler");
      // Loading indicator should be gone
      const loading = editor.querySelector(".atom-loading");
      expect(loading).not.toBeInTheDocument();
    });

    it("handles multiple concurrent enrichment transactions", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        const view = component.getView();
        const nodes = [
          searchSchema.nodes["field-value"].create({
            field: "user",
            value: "102112",
          }),
          searchSchema.text(" "),
          searchSchema.nodes["field-value"].create({
            field: "project",
            value: "214246",
          }),
        ];
        const tr = view.state.tr.replaceWith(1, 1, nodes);
        view.dispatch(tr);
      });

      // Enrich both atoms
      await act(() => {
        const view = component.getView();
        const { doc } = view.state;
        const updates: Array<{ pos: number; displayValue: string }> = [];
        doc.descendants((node, pos) => {
          if (node.type.name === "field-value") {
            if (node.attrs.field === "user") {
              updates.push({ pos, displayValue: "Mitchell Kotler" });
            } else if (node.attrs.field === "project") {
              updates.push({ pos, displayValue: "Panama Papers" });
            }
          }
        });

        // Apply enrichments sequentially (simulating async resolution)
        for (const update of updates) {
          const currentView = component.getView();
          // Re-find node by field+value since positions may shift
          let currentPos: number | null = null;
          currentView.state.doc.descendants((node, pos) => {
            if (
              node.type.name === "field-value" &&
              ((node.attrs.field === "user" &&
                update.displayValue === "Mitchell Kotler") ||
                (node.attrs.field === "project" &&
                  update.displayValue === "Panama Papers"))
            ) {
              if (
                (node.attrs.field === "user" &&
                  update.displayValue === "Mitchell Kotler") ||
                (node.attrs.field === "project" &&
                  update.displayValue === "Panama Papers")
              ) {
                currentPos = pos;
                return false;
              }
            }
          });
          if (currentPos !== null) {
            const tr = currentView.state.tr.setNodeMarkup(
              currentPos,
              undefined,
              {
                ...currentView.state.doc.nodeAt(currentPos)!.attrs,
                displayValue: update.displayValue,
              },
            );
            currentView.dispatch(tr);
          }
        }
      });

      const atoms = editor.querySelectorAll(".search-field-value");
      expect(atoms.length).toBe(2);
      expect(atoms[0]?.textContent).toContain("Mitchell Kotler");
      expect(atoms[1]?.textContent).toContain("Panama Papers");
    });
  });

  describe("atom accessibility (aria-activedescendant)", () => {
    it("atom wrapper has id, tabindex, and role", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.id).toMatch(/^search-atom-\d+$/);
      expect(wrapper.getAttribute("tabindex")).toBe("-1");
      expect(wrapper.getAttribute("role")).toBe("option");
    });

    it("sets aria-activedescendant on the editor when atom is selected", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      const view = component.getView();

      // Select the atom via NodeSelection
      await act(() => {
        let nodePos: number | null = null;
        view.state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === "field-value") {
            nodePos = pos;
            return false;
          }
        });
        expect(nodePos).not.toBeNull();
        // Select the atom node (NodeSelection highlights the whole node, not a text range)
        const tr = view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, nodePos!),
        );
        view.dispatch(tr);
      });

      expect(view.dom.getAttribute("aria-activedescendant")).toBe(wrapper.id);
    });

    it("clears aria-activedescendant when atom is deselected", async () => {
      const { component } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const view = component.getView();

      // Select the atom
      await act(() => {
        let nodePos: number | null = null;
        view.state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === "field-value") {
            nodePos = pos;
            return false;
          }
        });
        const tr = view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, nodePos!),
        );
        view.dispatch(tr);
      });

      expect(view.dom.getAttribute("aria-activedescendant")).toBeTruthy();

      // Move selection away (text cursor at end of doc)
      await act(() => {
        // Move cursor to a text position, deselecting the atom
        const endPos = view.state.doc.content.size - 1;
        const tr = view.state.tr.setSelection(
          TextSelection.create(view.state.doc, endPos),
        );
        view.dispatch(tr);
      });

      expect(view.dom.getAttribute("aria-activedescendant")).toBeNull();
    });

    it("field-value atom wrapper has aria-label describing the atom", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          prefix: "+",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.getAttribute("aria-label")).toBe("required, user: 102112");
    });

    it("field-value atom wrapper aria-label uses displayValue when available", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          displayValue: "Mitchell Kotler",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.getAttribute("aria-label")).toBe("user: Mitchell Kotler");
    });

    it("range atom wrapper has aria-label describing the range", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "range", {
          field: "created_at",
          lower: "NOW-1MONTH",
          upper: "*",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.getAttribute("aria-label")).toBe(
        "created_at: from NOW-1MONTH to any",
      );
    });

    it("sort atom wrapper has aria-label describing sort direction", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "sort", {
          field: "page_count",
          direction: "desc",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.getAttribute("aria-label")).toBe(
        "Sort by page_count, descending",
      );
    });

    it("aria-label updates when node attributes change", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const wrapper = editor.querySelector(".search-nodeview") as HTMLElement;
      expect(wrapper.getAttribute("aria-label")).toBe("user: 102112");

      // Simulate enrichment updating displayValue
      await act(() => {
        const view = component.getView();
        let nodePos: number | null = null;
        view.state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === "field-value") {
            nodePos = pos;
            return false;
          }
        });
        const tr = view.state.tr.setNodeMarkup(nodePos!, undefined, {
          ...view.state.doc.nodeAt(nodePos!)!.attrs,
          displayValue: "Mitchell Kotler",
        });
        view.dispatch(tr);
      });

      expect(wrapper.getAttribute("aria-label")).toBe("user: Mitchell Kotler");
    });

    it("each atom type has role='option'", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        const view = component.getView();
        const nodes = [
          searchSchema.nodes["field-value"].create({
            field: "user",
            value: "102112",
          }),
          searchSchema.text(" "),
          searchSchema.nodes["range"].create({
            field: "created_at",
            lower: "NOW-1MONTH",
            upper: "*",
          }),
          searchSchema.text(" "),
          searchSchema.nodes["sort"].create({
            field: "page_count",
            direction: "desc",
          }),
        ];
        const tr = view.state.tr.replaceWith(1, 1, nodes);
        view.dispatch(tr);
      });

      const wrappers = editor.querySelectorAll(".search-nodeview");
      expect(wrappers.length).toBe(3);
      wrappers.forEach((wrapper) => {
        expect(wrapper.getAttribute("role")).toBe("option");
        expect(wrapper.id).toMatch(/^search-atom-\d+$/);
        expect(wrapper.getAttribute("tabindex")).toBe("-1");
      });
    });
  });
});
