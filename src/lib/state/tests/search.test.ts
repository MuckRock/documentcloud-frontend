import type { Document, DocumentResults, Pending } from "$lib/api/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { writable } from "svelte/store";

import { SearchResultsState } from "$lib/state/search.svelte";
import searchFixture from "@/test/fixtures/documents/search-highlight.json";

const fixture = searchFixture as unknown as DocumentResults;

describe("SearchResultsState", () => {
  let search: SearchResultsState;

  beforeEach(() => {
    search = new SearchResultsState();
  });

  describe("setResults", () => {
    it("populates visible from API response", async () => {
      await search.setResults(Promise.resolve({ data: fixture }));

      expect(search.visible.size).toBe(fixture.results.length);
      expect(search.total).toBe(fixture.count);
      expect(search.next).toBe(fixture.next);
      expect(search.loading).toBe(false);
    });

    it("clears previous results", async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
      const firstSize = search.visible.size;

      // load a subset
      const partial: DocumentResults = {
        ...fixture,
        results: fixture.results.slice(0, 2),
        count: 2,
        next: null,
      };
      await search.setResults(Promise.resolve({ data: partial }));

      expect(search.visible.size).toBe(2);
      expect(search.visible.size).not.toBe(firstSize);
    });

    it("sets loading to false when data is null", async () => {
      await search.setResults(Promise.resolve({ data: undefined }));

      expect(search.loading).toBe(false);
      expect(search.visible.size).toBe(0);
    });
  });

  describe("selection", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("selected returns documents matching selectedIds", () => {
      const ids = [...search.visible.keys()].slice(0, 2);
      for (const id of ids) {
        search.selectedIds.add(id);
      }

      expect(search.selected).toHaveLength(2);
      expect(search.selected.map((d) => String(d.id))).toEqual(ids);
    });

    it("selected filters out IDs not in visible", () => {
      search.selectedIds.add("9999999");

      expect(search.selected).toHaveLength(0);
    });

    it("selectAll adds all visible IDs", () => {
      search.selectAll();

      expect(search.selectedIds.size).toBe(search.visible.size);
      expect(search.selected).toHaveLength(search.visible.size);
    });

    it("deselectAll clears selectedIds", () => {
      search.selectAll();
      search.deselectAll();

      expect(search.selectedIds.size).toBe(0);
      expect(search.selected).toHaveLength(0);
    });

    it("editable is true when all selected docs have edit_access", () => {
      // patch all docs to be editable
      for (const [id, doc] of search.visible) {
        search.visible.set(id, { ...doc, edit_access: true });
      }
      search.selectAll();

      expect(search.editable).toBe(true);
    });

    it("editable is false when any selected doc lacks edit_access", () => {
      // patch all to editable, then make one not
      for (const [id, doc] of search.visible) {
        search.visible.set(id, { ...doc, edit_access: true });
      }
      const firstId = [...search.visible.keys()][0]!;
      const firstDoc = search.visible.get(firstId)!;
      search.visible.set(firstId, { ...firstDoc, edit_access: false });
      search.selectAll();

      expect(search.editable).toBe(false);
    });

    it("editable is false when nothing is selected", () => {
      expect(search.editable).toBe(false);
    });
  });

  describe("handleDeleted", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("removes documents from visible and decrements total", () => {
      const id = [...search.visible.keys()][0]!;
      const sizeBefore = search.visible.size;
      const totalBefore = search.total;

      search.handleDeleted(new Set([id]));

      expect(search.visible.has(id)).toBe(false);
      expect(search.visible.size).toBe(sizeBefore - 1);
      expect(search.total).toBe(totalBefore - 1);
    });

    it("does not decrement total below zero", () => {
      search.total = 0;
      search.handleDeleted(new Set(["nonexistent"]));

      expect(search.total).toBe(0);
    });

    it("ignores IDs not in visible", () => {
      const sizeBefore = search.visible.size;
      const totalBefore = search.total;

      search.handleDeleted(new Set(["9999999"]));

      expect(search.visible.size).toBe(sizeBefore);
      expect(search.total).toBe(totalBefore);
    });
  });

  describe("handleEdited", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("patches document fields in visible", () => {
      const id = [...search.visible.keys()][0]!;

      search.handleEdited(
        new Map([[id, { title: "Updated Title" } as Document]]),
      );

      expect(search.visible.get(id)!.title).toBe("Updated Title");
    });

    it("skips expandable fields like user and organization", () => {
      const id = [...search.visible.keys()][0]!;
      const originalUser = search.visible.get(id)!.user;

      search.handleEdited(
        new Map([[id, { user: { id: 999 } } as unknown as Document]]),
      );

      expect(search.visible.get(id)!.user).toEqual(originalUser);
    });

    it("ignores IDs not in visible", () => {
      const sizeBefore = search.visible.size;

      search.handleEdited(
        new Map([["9999999", { title: "Nope" } as Document]]),
      );

      expect(search.visible.size).toBe(sizeBefore);
    });
  });

  describe("handlePending", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("sets status to pending for matching docs", () => {
      const id = [...search.visible.keys()][0]!;

      search.handlePending([{ doc_id: Number(id) } as Pending]);

      expect(search.visible.get(id)!.status).toBe("pending");
    });

    it("does not overwrite already-pending docs", () => {
      const id = [...search.visible.keys()][0]!;
      const doc = search.visible.get(id)!;
      search.visible.set(id, { ...doc, status: "pending" });

      // get reference before
      const before = search.visible.get(id);

      search.handlePending([{ doc_id: Number(id) } as Pending]);

      // should be the same reference since status was already pending
      expect(search.visible.get(id)).toBe(before);
    });
  });

  describe("handleFinished", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("sets status to success for matching docs", () => {
      const id = [...search.visible.keys()][0]!;
      const doc = search.visible.get(id)!;
      search.visible.set(id, { ...doc, status: "pending" });

      search.handleFinished(new Set([Number(id)]));

      expect(search.visible.get(id)!.status).toBe("success");
    });

    it("does not overwrite already-successful docs", () => {
      const id = [...search.visible.keys()][0]!;
      const before = search.visible.get(id);

      search.handleFinished(new Set([Number(id)]));

      // should be the same reference since status was already success
      expect(search.visible.get(id)).toBe(before);
    });
  });

  describe("watch / unwatch", () => {
    beforeEach(async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
    });

    it("reacts to deleted store changes", () => {
      const id = [...search.visible.keys()][0]!;
      const deleted = writable(new Set<string>());

      search.watch({ deleted });
      deleted.set(new Set([id]));

      expect(search.visible.has(id)).toBe(false);

      search.unwatch();
    });

    it("reacts to edited store changes", () => {
      const id = [...search.visible.keys()][0]!;
      const edited = writable(new Map<string, Document>());

      search.watch({ edited });
      edited.set(new Map([[id, { title: "Edited" } as Document]]));

      expect(search.visible.get(id)!.title).toBe("Edited");

      search.unwatch();
    });

    it("unwatch stops reacting to changes", () => {
      const id = [...search.visible.keys()][0]!;
      const deleted = writable(new Set<string>());

      search.watch({ deleted });
      search.unwatch();

      deleted.set(new Set([id]));

      expect(search.visible.has(id)).toBe(true);
    });
  });

  describe("applyWatched", () => {
    it("re-applies current store values after reload", async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
      const id = [...search.visible.keys()][0]!;
      const deleted = writable(new Set([id]));

      search.watch({ deleted });
      // subscribe already removed it; simulate a reload that brings it back
      const doc = fixture.results.find((d) => String(d.id) === id)!;
      search.visible.set(id, doc as Document);
      search.total = fixture.results.length;

      search.applyWatched();

      expect(search.visible.has(id)).toBe(false);
      expect(search.total).toBe(fixture.results.length - 1);

      search.unwatch();
    });
  });

  describe("loadNext", () => {
    it("returns undefined when there is no next URL", async () => {
      search.next = null;

      expect(await search.loadNext()).toBeUndefined();
    });

    it("returns undefined when already loading", async () => {
      search.next = "http://example.com/next";
      search.loading = true;

      expect(await search.loadNext()).toBeUndefined();
    });

    it("appends results and updates next", async () => {
      await search.setResults(Promise.resolve({ data: fixture }));
      const sizeBefore = search.visible.size;

      // use the fixture's own next URL
      search.next = fixture.next;

      const nextPage: DocumentResults = {
        ...fixture,
        results: fixture.results.slice(0, 3),
        next: null,
        count: fixture.count,
      };

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify(nextPage), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const error = await search.loadNext();

      expect(error).toBeUndefined();
      // results were appended (some may overlap with existing, so size >= sizeBefore)
      expect(search.visible.size).toBeGreaterThanOrEqual(sizeBefore);
      expect(search.next).toBeNull();
      expect(search.loading).toBe(false);

      vi.unstubAllGlobals();
    });

    it("returns error message on fetch failure", async () => {
      search.next = "http://example.com/next";

      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({}), {
            status: 500,
            statusText: "Internal Server Error",
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const error = await search.loadNext();

      expect(error).toBeDefined();
      expect(search.loading).toBe(false);

      vi.unstubAllGlobals();
    });
  });
});
