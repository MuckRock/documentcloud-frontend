import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/svelte";
import SearchEditor from "../SearchEditor.svelte";
import { searchSchema } from "../schema";
import { serialize } from "../pm-serialize";

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
  const node = searchSchema.nodes[nodeType].create(attrs);
  const tr = view.state.tr.replaceSelectionWith(node);
  view.dispatch(tr);
}

describe("NodeViews in SearchEditor", () => {
  describe("field-value chip rendering", () => {
    it("renders a field-value node as a chip in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
        });
      });
      const chip = editor.querySelector(".search-field-value");
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toContain("user");
      expect(chip?.textContent).toContain("102112");
    });

    it("renders a field-value chip with displayValue", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          displayValue: "Mitchell Kotler",
        });
      });
      const chip = editor.querySelector(".search-field-value");
      expect(chip?.textContent).toContain("Mitchell Kotler");
    });

    it("renders a field-value chip with prefix", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "field-value", {
          field: "user",
          value: "102112",
          prefix: "+",
        });
      });
      const prefix = editor.querySelector(".chip-prefix-required");
      expect(prefix).toBeInTheDocument();
    });
  });

  describe("range chip rendering", () => {
    it("renders a range node as a chip in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "range", {
          field: "created_at",
          lower: "NOW-1MONTH",
          upper: "*",
        });
      });
      const chip = editor.querySelector(".search-range");
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toContain("created_at");
    });
  });

  describe("sort chip rendering", () => {
    it("renders a sort node as a chip in the editor", async () => {
      const { component, editor } = await renderEditor();
      await act(() => {
        insertNode(component, "sort", {
          field: "page_count",
          direction: "desc",
        });
      });
      const chip = editor.querySelector(".search-sort");
      expect(chip).toBeInTheDocument();
      expect(chip?.textContent).toContain("page_count");
      expect(chip?.textContent).toContain("\u2193"); // ↓
    });
  });

  describe("serialization still works with NodeViews", () => {
    it("serializes field-value chip correctly", async () => {
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

    it("serializes mixed content with chips and text", async () => {
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
      const chip = editor.querySelector(".search-field-value");
      expect(chip?.textContent).toContain("102112");
      // Loading indicator should be visible for entity fields without displayValue
      const loading = editor.querySelector(".chip-loading");
      expect(loading).toBeInTheDocument();
    });

    it("updates chip when displayValue is set via transaction", async () => {
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
        const tr = view.state.tr.setNodeMarkup(nodePos!, undefined, {
          ...view.state.doc.nodeAt(nodePos!)!.attrs,
          displayValue: "Mitchell Kotler",
        });
        view.dispatch(tr);
      });

      const chip = editor.querySelector(".search-field-value");
      expect(chip?.textContent).toContain("Mitchell Kotler");
      // Loading indicator should be gone
      const loading = editor.querySelector(".chip-loading");
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

      // Enrich both chips
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

      const chips = editor.querySelectorAll(".search-field-value");
      expect(chips.length).toBe(2);
      expect(chips[0]?.textContent).toContain("Mitchell Kotler");
      expect(chips[1]?.textContent).toContain("Panama Papers");
    });
  });
});
