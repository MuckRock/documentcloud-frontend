import { describe, it, expect } from "vitest";
import { EditorState, NodeSelection, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { searchSchema } from "../../schema";
import { atomNavigationKeymap } from "../atom-navigation-plugin";

const { nodes } = searchSchema;

function makeAtom(type: "field-value" | "range" | "sort") {
  switch (type) {
    case "field-value":
      return nodes["field-value"].create({
        field: "access",
        value: "public",
        prefix: null,
        quoted: false,
        displayValue: null,
      });
    case "range":
      return nodes["range"].create({
        field: "created_at",
        lower: "NOW-1MONTH",
        upper: "*",
      });
    case "sort":
      return nodes["sort"].create({ field: "created_at", direction: "asc" });
  }
}

/** Build: <doc><p>a {atom} b</p></doc> */
function docWithAtom(type: "field-value" | "range" | "sort" = "field-value") {
  const para = nodes["paragraph"].create(null, [
    searchSchema.text("a "),
    makeAtom(type),
    searchSchema.text(" b"),
  ]);
  return nodes["doc"].create(null, para);
}

function createView(doc: ReturnType<typeof nodes.doc.create>) {
  const div = document.createElement("div");
  // Set up editor state with the atom navigation plugin active
  const state = EditorState.create({
    doc,
    plugins: [atomNavigationKeymap(), keymap(baseKeymap)],
  });
  return new EditorView(div, { state });
}

function findAtomPos(
  doc: ReturnType<typeof nodes.doc.create>,
  typeName: string,
): number {
  let pos = -1;
  doc.descendants((node, p) => {
    if (pos === -1 && node.type.name === typeName) pos = p;
  });
  return pos;
}

/** Dispatch a keydown event through ProseMirror's event handling. */
function pressKey(view: EditorView, key: string) {
  view.dom.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("atom-navigation-plugin", () => {
  describe("ArrowLeft into atom", () => {
    it("selects a field-value atom when cursor is immediately after it", () => {
      const doc = docWithAtom("field-value");
      const view = createView(doc);
      const atomPos = findAtomPos(doc, "field-value");

      // Place cursor right after the atom node
      const afterAtom = atomPos + 1;
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, afterAtom),
        ),
      );

      pressKey(view, "ArrowLeft");

      // Verify the arrow key converted the TextSelection into a NodeSelection on the atom
      expect(view.state.selection).toBeInstanceOf(NodeSelection);
      expect((view.state.selection as NodeSelection).node.type.name).toBe(
        "field-value",
      );
      view.destroy();
    });

    it("selects a range atom when cursor is immediately after it", () => {
      const doc = docWithAtom("range");
      const view = createView(doc);
      const atomPos = findAtomPos(doc, "range");

      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, atomPos + 1),
        ),
      );

      pressKey(view, "ArrowLeft");

      expect(view.state.selection).toBeInstanceOf(NodeSelection);
      expect((view.state.selection as NodeSelection).node.type.name).toBe(
        "range",
      );
      view.destroy();
    });

    it("does not select when cursor is not adjacent to an atom", () => {
      const doc = docWithAtom("field-value");
      const view = createView(doc);

      // Cursor at start of paragraph (pos=1), before "a "
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, 1)),
      );

      pressKey(view, "ArrowLeft");

      // Should remain a TextSelection (or move normally), not become NodeSelection
      expect(view.state.selection).not.toBeInstanceOf(NodeSelection);
      view.destroy();
    });
  });

  describe("ArrowRight into atom", () => {
    it("selects a field-value atom when cursor is immediately before it", () => {
      const doc = docWithAtom("field-value");
      const view = createView(doc);
      const atomPos = findAtomPos(doc, "field-value");

      // Place cursor right before the atom
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, atomPos),
        ),
      );

      pressKey(view, "ArrowRight");

      expect(view.state.selection).toBeInstanceOf(NodeSelection);
      expect((view.state.selection as NodeSelection).node.type.name).toBe(
        "field-value",
      );
      view.destroy();
    });

    it("selects a sort atom when cursor is immediately before it", () => {
      const doc = docWithAtom("sort");
      const view = createView(doc);
      const atomPos = findAtomPos(doc, "sort");

      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, atomPos),
        ),
      );

      pressKey(view, "ArrowRight");

      expect(view.state.selection).toBeInstanceOf(NodeSelection);
      expect((view.state.selection as NodeSelection).node.type.name).toBe(
        "sort",
      );
      view.destroy();
    });

    it("does not select when cursor is not adjacent to an atom", () => {
      const doc = docWithAtom("field-value");
      const view = createView(doc);

      // Cursor at end of paragraph, after " b"
      const endPos = view.state.doc.content.size - 1;
      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(view.state.doc, endPos),
        ),
      );

      pressKey(view, "ArrowRight");

      expect(view.state.selection).not.toBeInstanceOf(NodeSelection);
      view.destroy();
    });
  });

  describe("ArrowDown into popover", () => {
    it("does not activate for sort atoms", () => {
      const doc = docWithAtom("sort");
      const view = createView(doc);
      const atomPos = findAtomPos(doc, "sort");

      // Select the sort atom
      view.dispatch(
        view.state.tr.setSelection(
          NodeSelection.create(view.state.doc, atomPos),
        ),
      );

      pressKey(view, "ArrowDown");

      // Sort atoms are excluded from popover navigation, so
      // selection should remain on the sort atom (no-op)
      expect(view.state.selection).toBeInstanceOf(NodeSelection);
      expect((view.state.selection as NodeSelection).node.type.name).toBe(
        "sort",
      );
      view.destroy();
    });

    it("does not activate when selection is text", () => {
      const doc = docWithAtom("field-value");
      const view = createView(doc);

      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, 1)),
      );

      pressKey(view, "ArrowDown");

      // Should remain a TextSelection
      expect(view.state.selection).toBeInstanceOf(TextSelection);
      view.destroy();
    });
  });
});
