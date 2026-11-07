import { describe, it, expect } from "vitest";

import { EditHistory } from "../edit.svelte";

// Seven letter-size pages, indexed 0-6.
const SPEC = "612.0x792.0:0-6";

function history(spec: string | undefined = SPEC) {
  return new EditHistory(() => spec);
}

/** The ID of the page currently at `position` (zero-indexed). */
function idAt(h: EditHistory, position: number): number {
  return h.current[position]!.id;
}

const indexes = (h: EditHistory) => h.current.map(({ index }) => index);
const rotations = (h: EditHistory) => h.current.map(({ rotation }) => rotation);

describe("EditHistory", () => {
  it("starts from the document's pages with no entries", () => {
    const h = history();

    expect(h.hasEntries).toBe(false);
    expect(indexes(h)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("has no pages when the document has no page spec", () => {
    expect(new EditHistory(() => undefined).current).toEqual([]);
  });

  describe("rotate", () => {
    it("rotates only the targeted pages, swapping their dimensions", () => {
      const h = history();
      const before = h.current[2]!;

      h.edit({ action: "cw", pages: [idAt(h, 2)] });

      expect(rotations(h)).toEqual([0, 0, 90, 0, 0, 0, 0]);
      const after = h.current[2]!;
      expect(after.id).toBe(before.id);
      expect([after.width, after.height]).toEqual([
        before.height,
        before.width,
      ]);
    });

    it("rotates counterclockwise to negative degrees", () => {
      const h = history();
      h.edit({ action: "ccw", pages: [idAt(h, 0), idAt(h, 1)] });

      expect(rotations(h)).toEqual([-90, -90, 0, 0, 0, 0, 0]);
    });
  });

  it("deletes the targeted pages", () => {
    const h = history();
    h.edit({ action: "delete", pages: [idAt(h, 1), idAt(h, 4)] });

    expect(indexes(h)).toEqual([0, 2, 3, 5, 6]);
  });

  describe("duplicate", () => {
    it("inserts copies with new IDs right after the position page", () => {
      const h = history();
      const source = idAt(h, 1);

      h.edit({ action: "duplicate", pages: [source], position: source });

      expect(indexes(h)).toEqual([0, 1, 1, 2, 3, 4, 5, 6]);
      expect(h.current[2]!.id).not.toBe(source);
    });

    it("keeps the source page's rotation on the copy", () => {
      const h = history();
      const source = idAt(h, 0);
      h.edit({ action: "cw", pages: [source] });
      h.edit({ action: "duplicate", pages: [source], position: source });

      expect(rotations(h).slice(0, 2)).toEqual([90, 90]);
    });

    it("keeps duplicated pages in document order", () => {
      const h = history();
      h.edit({
        action: "duplicate",
        pages: [idAt(h, 4), idAt(h, 2)],
        position: idAt(h, 6),
      });

      expect(indexes(h)).toEqual([0, 1, 2, 3, 4, 5, 6, 2, 4]);
    });
  });

  describe("move", () => {
    it("moves pages to just after the position page", () => {
      const h = history();
      h.edit({ action: "move", pages: [idAt(h, 0)], position: idAt(h, 2) });

      expect(indexes(h)).toEqual([1, 2, 0, 3, 4, 5, 6]);
    });

    it("moves a page to the front when no page precedes the position", () => {
      // Page's "Move up" on the second page has no page two slots back.
      const h = history();
      h.edit({ action: "move", pages: [idAt(h, 1)], position: -1 });

      expect(indexes(h)).toEqual([1, 0, 2, 3, 4, 5, 6]);
    });
  });

  describe("undo and discard", () => {
    it("undoes one edit at a time, back to the original pages", () => {
      const h = history();
      h.edit({ action: "delete", pages: [idAt(h, 0)] });
      h.edit({ action: "cw", pages: [idAt(h, 0)] });

      h.undo();
      expect(indexes(h)).toEqual([1, 2, 3, 4, 5, 6]);
      expect(rotations(h).every((r) => r === 0)).toBe(true);

      h.undo();
      expect(indexes(h)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(h.hasEntries).toBe(false);
    });

    it("leaves earlier entries untouched when rotating", () => {
      const h = history();
      const original = h.current;
      h.edit({ action: "cw", pages: [idAt(h, 0)] });

      expect(original[0]!.rotation).toBe(0);
    });

    it("discards every edit", () => {
      const h = history();
      h.edit({ action: "delete", pages: [idAt(h, 0)] });
      h.edit({ action: "delete", pages: [idAt(h, 0)] });

      h.discard();

      expect(h.hasEntries).toBe(false);
      expect(indexes(h)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe("serialized", () => {
    it("describes an unedited document as one unrotated range", () => {
      expect(history().serialized).toEqual([
        { page: "0-6", modifications: [] },
      ]);
    });

    it("lists a single page without a range", () => {
      expect(history("612.0x792.0:0").serialized).toEqual([
        { page: "0", modifications: [] },
      ]);
    });

    it("splits runs at deleted pages", () => {
      const h = history();
      h.edit({ action: "delete", pages: [idAt(h, 3)] });

      expect(h.serialized).toEqual([{ page: "0-2,4-6", modifications: [] }]);
    });

    it("splits runs at reordered and duplicated pages", () => {
      const h = history();
      const first = idAt(h, 0);
      h.edit({ action: "move", pages: [first], position: idAt(h, 6) });
      h.edit({ action: "duplicate", pages: [first], position: first });

      expect(h.serialized).toEqual([{ page: "1-6,0,0", modifications: [] }]);
    });

    it("groups consecutive pages that share a rotation", () => {
      const h = history();
      h.edit({ action: "cw", pages: [idAt(h, 2), idAt(h, 3)] });

      expect(h.serialized).toEqual([
        { page: "0-1", modifications: [] },
        { page: "2-3", modifications: [{ type: "rotate", angle: "cc" }] },
        { page: "4-6", modifications: [] },
      ]);
    });

    it.each([
      [["cw"], "cc"],
      [["ccw"], "ccw"],
      [["cw", "cw"], "hw"],
      [["ccw", "ccw"], "hw"],
      [["ccw", "ccw", "ccw"], "cc"],
    ] as const)("serializes %j as the API angle %s", (turns, angle) => {
      const h = history("612.0x792.0:0");
      for (const action of turns) {
        h.edit({ action, pages: [idAt(h, 0)] });
      }

      expect(h.serialized).toEqual([
        { page: "0", modifications: [{ type: "rotate", angle }] },
      ]);
    });

    it("sends no rotation for a page turned a full circle", () => {
      const h = history("612.0x792.0:0");
      for (let i = 0; i < 4; i++) {
        h.edit({ action: "cw", pages: [idAt(h, 0)] });
      }

      expect(h.serialized).toEqual([{ page: "0", modifications: [] }]);
    });
  });
});
