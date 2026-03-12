import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/svelte";
import SearchEditor from "../../../SearchEditor.svelte";
import { searchSchema } from "../../schema";
import { serialize } from "../../../utils/serialize";

/** Mock DataTransfer for jsdom which doesn't have it */
class MockDataTransfer {
  private data = new Map<string, string>();
  setData(format: string, value: string) {
    this.data.set(format, value);
  }
  getData(format: string): string {
    return this.data.get(format) ?? "";
  }
}

/** Render the editor and wait for ProseMirror to initialize */
async function renderEditor(props: Record<string, unknown> = {}) {
  const result = render(SearchEditor, { props });
  await act();
  const editor = result.container.querySelector(".ProseMirror") as HTMLElement;
  return { ...result, editor };
}

describe("Clipboard plugin", () => {
  describe("copy", () => {
    it("serializes selection to clipboard as plain text on copy", async () => {
      const { component, editor } = await renderEditor({
        initialQuery: "user:102112 AND access:private",
      });
      const view = component.getView();

      // Select all content in the editor
      const { TextSelection } = await import("prosemirror-state");
      const { state } = view;
      const tr = state.tr.setSelection(
        TextSelection.create(state.doc, 1, state.doc.content.size - 1),
      );
      view.dispatch(tr);

      // Create a mock clipboard event
      const clipboardData = new MockDataTransfer();
      const copyEvent = new Event("copy", { bubbles: true }) as any;
      copyEvent.clipboardData = clipboardData;
      copyEvent.preventDefault = vi.fn();

      editor.dispatchEvent(copyEvent);

      // The clipboard should contain the serialized Lucene text
      const text = clipboardData.getData("text/plain");
      expect(text).toContain("user:102112");
      expect(text).toContain("access:private");
    });
  });

  describe("paste deserialization", () => {
    it("editor uses clipboardTextParser to deserialize pasted Lucene text", async () => {
      // The clipboardTextParser prop is tested indirectly:
      // when ProseMirror processes pasted text, it calls our parser.
      // In jsdom, paste events don't flow through PM's full pipeline,
      // so we test the parser function directly.
      const { deserialize } = await import("../../../utils/deserialize");

      // Verify the deserializer produces structured nodes from pasted text
      const doc = deserialize("user:102112 AND access:private");
      const query = serialize(doc);
      expect(query).toBe("user:102112 AND access:private");

      // Verify chips are created
      let chipCount = 0;
      doc.descendants((node) => {
        if (node.type.name === "field-value") chipCount++;
      });
      expect(chipCount).toBe(2);
    });

    it("clipboardTextParser handles sort directives", async () => {
      const { deserialize } = await import("../../../utils/deserialize");
      const doc = deserialize("sort:-page_count");
      const query = serialize(doc);
      expect(query).toBe("sort:-page_count");

      let sortCount = 0;
      doc.descendants((node) => {
        if (node.type.name === "sort") sortCount++;
      });
      expect(sortCount).toBe(1);
    });

    it("clipboardTextParser passes through plain text", async () => {
      const { deserialize } = await import("../../../utils/deserialize");
      const doc = deserialize("just some plain text");
      const query = serialize(doc);
      expect(query).toBe("just some plain text");
    });

    it("pasted text with NOT gets operator decorations (truthful interpretation)", async () => {
      const { deserialize } = await import("../../../utils/deserialize");
      const doc = deserialize("mueller NOT report");
      const query = serialize(doc);
      // NOT should be preserved as text (decorations are render-only, not in the doc)
      expect(query).toBe("mueller NOT report");
    });
  });
});
