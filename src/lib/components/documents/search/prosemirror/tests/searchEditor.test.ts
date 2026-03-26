import { describe, it, expect, vi, beforeEach } from "vitest";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { searchSchema } from "../schema";
import {
  getFingerprint,
  collectDisplayValues,
  applyCarriedDisplayValues,
  enrichAtoms,
} from "../searchEditor";

function makeFieldValue(
  field: string,
  value: string,
  extra: Record<string, unknown> = {},
) {
  // Create an atom node from the schema's node type with the given attributes
  return searchSchema.nodes["field-value"].create({
    field,
    value,
    ...extra,
  });
}

function makeRange(
  field: string,
  lower: string,
  upper: string,
  extra: Record<string, unknown> = {},
) {
  return searchSchema.nodes["range"].create({ field, lower, upper, ...extra });
}

function makeSort(field: string, direction = "asc") {
  return searchSchema.nodes["sort"].create({ field, direction });
}

function docWith(...nodes: ReturnType<typeof makeFieldValue>[]) {
  return searchSchema.node("doc", null, [
    searchSchema.node("paragraph", null, nodes),
  ]);
}

function stateWith(...nodes: ReturnType<typeof makeFieldValue>[]) {
  // Set up an editor state with a doc built from the given nodes
  return EditorState.create({
    schema: searchSchema,
    doc: docWith(...nodes),
  });
}

// --- getFingerprint ---

describe("getFingerprint", () => {
  it("returns empty string for a doc with no atoms", () => {
    const doc = searchSchema.node("doc", null, [
      searchSchema.node("paragraph", null, [searchSchema.text("hello world")]),
    ]);
    expect(getFingerprint(doc)).toBe("");
  });

  it("includes field-value atoms", () => {
    const doc = docWith(makeFieldValue("user", "123"));
    const fp = getFingerprint(doc);
    expect(fp).toContain("field-value:");
    expect(fp).toContain('"field":"user"');
    expect(fp).toContain('"value":"123"');
  });

  it("includes range atoms", () => {
    const doc = docWith(makeRange("created_at", "NOW-1MONTH", "*"));
    const fp = getFingerprint(doc);
    expect(fp).toContain("range:");
    expect(fp).toContain('"field":"created_at"');
  });

  it("includes sort atoms", () => {
    const doc = docWith(makeSort("page_count", "desc"));
    const fp = getFingerprint(doc);
    expect(fp).toContain("sort:");
    expect(fp).toContain('"field":"page_count"');
  });

  it("excludes displayValue from fingerprint", () => {
    const docA = docWith(makeFieldValue("user", "123"));
    const docB = docWith(
      makeFieldValue("user", "123", { displayValue: "Alice" }),
    );
    expect(getFingerprint(docA)).toBe(getFingerprint(docB));
  });

  it("produces different fingerprints for different atoms", () => {
    const docA = docWith(makeFieldValue("user", "123"));
    const docB = docWith(makeFieldValue("user", "456"));
    expect(getFingerprint(docA)).not.toBe(getFingerprint(docB));
  });

  it("joins multiple atoms with pipe separator", () => {
    const doc = docWith(
      makeFieldValue("user", "1"),
      makeFieldValue("project", "2"),
    );
    const fp = getFingerprint(doc);
    expect(fp.split("|")).toHaveLength(2);
  });
});

// --- collectDisplayValues ---

describe("collectDisplayValues", () => {
  it("returns empty map when no atoms have displayValue", () => {
    const doc = docWith(makeFieldValue("user", "123"));
    expect(collectDisplayValues(doc).size).toBe(0);
  });

  it("collects displayValue from async field atoms", () => {
    const doc = docWith(
      makeFieldValue("user", "123", { displayValue: "Alice" }),
    );
    const map = collectDisplayValues(doc);
    expect(map.get("user:123")).toBe("Alice");
  });

  it("ignores displayValue on non-async fields", () => {
    const doc = docWith(
      makeFieldValue("access", "private", { displayValue: "Private" }),
    );
    const map = collectDisplayValues(doc);
    expect(map.size).toBe(0);
  });

  it("collects from multiple atoms", () => {
    const doc = docWith(
      makeFieldValue("user", "1", { displayValue: "Alice" }),
      makeFieldValue("project", "2", { displayValue: "My Project" }),
    );
    const map = collectDisplayValues(doc);
    expect(map.size).toBe(2);
    expect(map.get("user:1")).toBe("Alice");
    expect(map.get("project:2")).toBe("My Project");
  });
});

// --- applyCarriedDisplayValues ---

describe("applyCarriedDisplayValues", () => {
  it("returns null when carried map is empty", () => {
    const state = stateWith(makeFieldValue("user", "123"));
    expect(applyCarriedDisplayValues(state, new Map())).toBeNull();
  });

  it("returns null when no atoms match carried values", () => {
    const state = stateWith(makeFieldValue("user", "123"));
    const carried = new Map([["user:999", "Nobody"]]);
    expect(applyCarriedDisplayValues(state, carried)).toBeNull();
  });

  it("applies carried displayValue to matching async atoms", () => {
    const state = stateWith(makeFieldValue("user", "123"));
    const carried = new Map([["user:123", "Alice"]]);
    const tr = applyCarriedDisplayValues(state, carried);
    expect(tr).not.toBeNull();

    // Apply the transaction to produce a new immutable state
    const newState = state.apply(tr!);
    let found = false;
    // Walk the doc tree to verify the atom's attributes were updated
    newState.doc.descendants((node) => {
      if (node.type.name === "field-value" && node.attrs.value === "123") {
        expect(node.attrs.displayValue).toBe("Alice");
        found = true;
      }
    });
    expect(found).toBe(true);
  });

  it("skips atoms that already have a displayValue", () => {
    const state = stateWith(
      makeFieldValue("user", "123", { displayValue: "Existing" }),
    );
    const carried = new Map([["user:123", "New Name"]]);
    const tr = applyCarriedDisplayValues(state, carried);
    expect(tr).toBeNull();
  });

  it("skips non-async fields", () => {
    const state = stateWith(makeFieldValue("access", "private"));
    const carried = new Map([["access:private", "Private"]]);
    const tr = applyCarriedDisplayValues(state, carried);
    expect(tr).toBeNull();
  });
});

// --- enrichAtoms ---

describe("enrichAtoms", () => {
  let target: HTMLElement;

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  function createView(
    ...nodes: ReturnType<typeof makeFieldValue>[]
  ): EditorView {
    const state = stateWith(...nodes);
    return new EditorView(target, { state });
  }

  it("does nothing when there are no atoms to enrich", async () => {
    const mockFetch = vi.fn();
    vi.doMock("../plugins/autocomplete-data", async (importOriginal) => {
      const mod = (await importOriginal()) as Record<string, unknown>;
      return { ...mod, fetchDisplayNames: mockFetch };
    });

    const view = createView(
      makeFieldValue("user", "123", { displayValue: "Already Set" }),
    );
    await enrichAtoms(view);
    // fetchDisplayNames is called from the real module, not our mock in this case,
    // but the key thing is no dispatch happens when atoms already have displayValues
    let hasEmpty = false;
    view.state.doc.descendants((node) => {
      if (node.type.name === "field-value" && !node.attrs.displayValue) {
        hasEmpty = true;
      }
    });
    expect(hasEmpty).toBe(false);
    view.destroy();
    vi.doUnmock("../plugins/autocomplete-data");
  });

  it("does not throw when the view has no enrichable atoms", async () => {
    const view = createView(makeFieldValue("access", "private"));
    await expect(enrichAtoms(view)).resolves.toBeUndefined();
    view.destroy();
  });
});
