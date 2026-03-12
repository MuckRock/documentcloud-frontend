import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/svelte";
import SearchEditor from "../../../SearchEditor.svelte";

/** Render the editor and wait for ProseMirror to initialize */
async function renderEditor(props: Record<string, unknown> = {}) {
  const result = render(SearchEditor, { props });
  await act();
  const editor = result.container.querySelector(".ProseMirror") as HTMLElement;
  return { ...result, editor };
}

/** Get all decoration elements of a given class within the editor */
function getDecorations(editor: HTMLElement, className: string) {
  return Array.from(editor.querySelectorAll(`.${className}`));
}

describe("Decoration Plugin", () => {
  describe("Boolean operators", () => {
    it("decorates AND as a boolean operator", async () => {
      const { editor } = await renderEditor({
        initialQuery: "mueller AND report",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(1);
      expect(ops[0]?.textContent).toBe("AND");
    });

    it("decorates OR as a boolean operator", async () => {
      const { editor } = await renderEditor({
        initialQuery: "mueller OR report",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(1);
      expect(ops[0]?.textContent).toBe("OR");
    });

    it("decorates NOT as a boolean operator", async () => {
      const { editor } = await renderEditor({
        initialQuery: "NOT mueller",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(1);
      expect(ops[0]?.textContent).toBe("NOT");
    });

    it("decorates multiple operators in one query", async () => {
      const { editor } = await renderEditor({
        initialQuery: "mueller AND report OR memo",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(2);
      expect(ops[0]?.textContent).toBe("AND");
      expect(ops[1]?.textContent).toBe("OR");
    });

    it("does not decorate lowercase 'and'", async () => {
      const { editor } = await renderEditor({
        initialQuery: "mueller and report",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(0);
    });

    it("does not decorate 'ANDY' (must be whole word)", async () => {
      const { editor } = await renderEditor({
        initialQuery: "ANDY report",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(0);
    });

    it("does not decorate 'ORGANIC' containing OR", async () => {
      const { editor } = await renderEditor({
        initialQuery: "ORGANIC food",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(0);
    });

    it("does not decorate 'NOTHING' containing NOT", async () => {
      const { editor } = await renderEditor({
        initialQuery: "NOTHING found",
      });
      const ops = getDecorations(editor, "search-operator");
      expect(ops).toHaveLength(0);
    });
  });

  describe("Parentheses", () => {
    it("decorates parentheses as grouping", async () => {
      const { editor } = await renderEditor({
        initialQuery: "(mueller OR watergate) AND report",
      });
      const parens = getDecorations(editor, "search-paren");
      expect(parens).toHaveLength(2);
      expect(parens[0]?.textContent).toBe("(");
      expect(parens[1]?.textContent).toBe(")");
    });

    it("decorates nested parentheses", async () => {
      const { editor } = await renderEditor({
        initialQuery: "((a OR b) AND (c OR d))",
      });
      const parens = getDecorations(editor, "search-paren");
      expect(parens).toHaveLength(6);
    });
  });

  describe("Prefix operators", () => {
    it("decorates + prefix as required", async () => {
      const { editor } = await renderEditor({
        initialQuery: "+mueller report",
      });
      const prefixes = getDecorations(editor, "search-prefix-required");
      expect(prefixes).toHaveLength(1);
      expect(prefixes[0]?.textContent).toBe("+");
    });

    it("decorates - prefix as excluded", async () => {
      const { editor } = await renderEditor({
        initialQuery: "-report mueller",
      });
      const prefixes = getDecorations(editor, "search-prefix-excluded");
      expect(prefixes).toHaveLength(1);
      expect(prefixes[0]?.textContent).toBe("-");
    });

    it("does not decorate + or - in the middle of a word", async () => {
      const { editor } = await renderEditor({
        initialQuery: "foo+bar baz-qux",
      });
      const req = getDecorations(editor, "search-prefix-required");
      const exc = getDecorations(editor, "search-prefix-excluded");
      expect(req).toHaveLength(0);
      expect(exc).toHaveLength(0);
    });

    it("decorates + before a quoted phrase", async () => {
      const { editor } = await renderEditor({
        initialQuery: '+\"steve jobs\" macintosh',
      });
      const prefixes = getDecorations(editor, "search-prefix-required");
      expect(prefixes).toHaveLength(1);
      expect(prefixes[0]?.textContent).toBe("+");
    });
  });

  describe("Mixed content", () => {
    it("decorates operators and parens in a complex query", async () => {
      const { editor } = await renderEditor({
        initialQuery: "(mueller OR watergate) AND NOT report",
      });
      const ops = getDecorations(editor, "search-operator");
      const parens = getDecorations(editor, "search-paren");
      expect(ops).toHaveLength(3); // OR, AND, NOT
      expect(parens).toHaveLength(2); // ( )
    });

    it("handles empty query without errors", async () => {
      const { editor } = await renderEditor({ initialQuery: "" });
      const ops = getDecorations(editor, "search-operator");
      const parens = getDecorations(editor, "search-paren");
      expect(ops).toHaveLength(0);
      expect(parens).toHaveLength(0);
    });
  });

  describe("Decorations update on content change", () => {
    it("adds decorations when operators are typed via updateQuery", async () => {
      const { component, editor } = await renderEditor({
        initialQuery: "mueller report",
      });
      expect(getDecorations(editor, "search-operator")).toHaveLength(0);

      await act(() => {
        component.updateQuery("mueller AND report");
      });
      expect(getDecorations(editor, "search-operator")).toHaveLength(1);
      expect(
        getDecorations(editor, "search-operator")[0]?.textContent,
      ).toBe("AND");
    });

    it("removes decorations when operators are removed", async () => {
      const { component, editor } = await renderEditor({
        initialQuery: "mueller AND report",
      });
      expect(getDecorations(editor, "search-operator")).toHaveLength(1);

      await act(() => {
        component.updateQuery("mueller report");
      });
      expect(getDecorations(editor, "search-operator")).toHaveLength(0);
    });
  });
});
