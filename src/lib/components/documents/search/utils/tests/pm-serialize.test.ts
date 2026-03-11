import { describe, it, expect } from "vitest";
import { searchSchema } from "../../prosemirror/schema";
import { serialize } from "../serialize";
import type { Node as ProseMirrorNode } from "prosemirror-model";

/** Helper to create a PM doc with a single paragraph containing the given inline nodes */
function doc(...content: ProseMirrorNode[]): ProseMirrorNode {
  return searchSchema.node("doc", null, [
    searchSchema.node("paragraph", null, content),
  ]);
}

function text(str: string): ProseMirrorNode {
  return searchSchema.text(str);
}

function fieldValue(attrs: {
  field: string;
  value: string;
  prefix?: string | null;
  boost?: number | null;
  quoted?: boolean;
  displayValue?: string | null;
}): ProseMirrorNode {
  return searchSchema.nodes["field-value"].create({
    field: attrs.field,
    value: attrs.value,
    prefix: attrs.prefix ?? null,
    boost: attrs.boost ?? null,
    quoted: attrs.quoted ?? false,
    displayValue: attrs.displayValue ?? null,
  });
}

function range(attrs: {
  field: string;
  lower: string;
  upper: string;
  inclusiveLower?: boolean;
  inclusiveUpper?: boolean;
  prefix?: string | null;
}): ProseMirrorNode {
  return searchSchema.nodes.range.create({
    field: attrs.field,
    lower: attrs.lower,
    upper: attrs.upper,
    inclusiveLower: attrs.inclusiveLower ?? true,
    inclusiveUpper: attrs.inclusiveUpper ?? true,
    prefix: attrs.prefix ?? null,
  });
}

function sort(attrs: { field: string; direction?: "asc" | "desc" }): ProseMirrorNode {
  return searchSchema.nodes.sort.create({
    field: attrs.field,
    direction: attrs.direction ?? "asc",
  });
}

describe("serialize", () => {
  describe("text-only documents", () => {
    it("serializes plain text", () => {
      expect(serialize(doc(text("report")))).toBe("report");
    });

    it("serializes a quoted phrase as-is (quotes are part of the text)", () => {
      expect(serialize(doc(text('"steve jobs" macintosh')))).toBe(
        '"steve jobs" macintosh',
      );
    });

    it("serializes an empty document", () => {
      const emptyDoc = searchSchema.node("doc", null, [
        searchSchema.node("paragraph", null, []),
      ]);
      expect(serialize(emptyDoc)).toBe("");
    });

    it("serializes text with operators as-is", () => {
      expect(serialize(doc(text("mueller AND report")))).toBe(
        "mueller AND report",
      );
    });
  });

  describe("field-value nodes", () => {
    it("serializes a basic field:value", () => {
      expect(
        serialize(doc(fieldValue({ field: "user", value: "102112" }))),
      ).toBe("user:102112");
    });

    it("serializes with + prefix", () => {
      expect(
        serialize(
          doc(fieldValue({ field: "user", value: "102112", prefix: "+" })),
        ),
      ).toBe("+user:102112");
    });

    it("serializes with - prefix", () => {
      expect(
        serialize(
          doc(fieldValue({ field: "access", value: "private", prefix: "-" })),
        ),
      ).toBe("-access:private");
    });

    it("serializes with quoted value", () => {
      expect(
        serialize(
          doc(
            fieldValue({
              field: "data_Folder",
              value: "From ARMY site",
              quoted: true,
            }),
          ),
        ),
      ).toBe('data_Folder:"From ARMY site"');
    });

    it("serializes with boost", () => {
      expect(
        serialize(
          doc(fieldValue({ field: "user", value: "102112", boost: 4 })),
        ),
      ).toBe("user:102112^4");
    });

    it("serializes with prefix, quoting, and boost together", () => {
      expect(
        serialize(
          doc(
            fieldValue({
              field: "title",
              value: "the report",
              prefix: "+",
              quoted: true,
              boost: 2,
            }),
          ),
        ),
      ).toBe('+title:"the report"^2');
    });

    it("ignores displayValue in serialization", () => {
      expect(
        serialize(
          doc(
            fieldValue({
              field: "user",
              value: "102112",
              displayValue: "Mitchell Kotler",
            }),
          ),
        ),
      ).toBe("user:102112");
    });
  });

  describe("range nodes", () => {
    it("serializes inclusive range", () => {
      expect(
        serialize(doc(range({ field: "page_count", lower: "10", upper: "100" }))),
      ).toBe("page_count:[10 TO 100]");
    });

    it("serializes exclusive range", () => {
      expect(
        serialize(
          doc(
            range({
              field: "page_count",
              lower: "10",
              upper: "100",
              inclusiveLower: false,
              inclusiveUpper: false,
            }),
          ),
        ),
      ).toBe("page_count:{10 TO 100}");
    });

    it("serializes mixed range (inclusive lower, exclusive upper)", () => {
      expect(
        serialize(
          doc(
            range({
              field: "page_count",
              lower: "10",
              upper: "100",
              inclusiveLower: true,
              inclusiveUpper: false,
            }),
          ),
        ),
      ).toBe("page_count:[10 TO 100}");
    });

    it("serializes open-ended range", () => {
      expect(
        serialize(
          doc(range({ field: "created_at", lower: "NOW-1MONTH", upper: "*" })),
        ),
      ).toBe("created_at:[NOW-1MONTH TO *]");
    });

    it("serializes range with prefix", () => {
      expect(
        serialize(
          doc(
            range({
              field: "page_count",
              lower: "10",
              upper: "100",
              prefix: "+",
            }),
          ),
        ),
      ).toBe("+page_count:[10 TO 100]");
    });
  });

  describe("sort nodes", () => {
    it("serializes ascending sort", () => {
      expect(serialize(doc(sort({ field: "page_count" })))).toBe(
        "sort:page_count",
      );
    });

    it("serializes descending sort", () => {
      expect(
        serialize(doc(sort({ field: "page_count", direction: "desc" }))),
      ).toBe("sort:-page_count");
    });

    it("serializes sort:created_at ascending", () => {
      expect(serialize(doc(sort({ field: "created_at" })))).toBe(
        "sort:created_at",
      );
    });
  });

  describe("mixed documents", () => {
    it("serializes text + field-value", () => {
      expect(
        serialize(
          doc(
            fieldValue({ field: "user", value: "102112", prefix: "+" }),
            text(" report"),
          ),
        ),
      ).toBe("+user:102112 report");
    });

    it("serializes text with AND and two field-values", () => {
      expect(
        serialize(
          doc(
            fieldValue({ field: "user", value: "102112", prefix: "+" }),
            text(" AND "),
            fieldValue({ field: "access", value: "private" }),
          ),
        ),
      ).toBe("+user:102112 AND access:private");
    });

    it("serializes complex mixed query", () => {
      expect(
        serialize(
          doc(
            fieldValue({ field: "user", value: "102112", prefix: "+" }),
            text(" "),
            range({ field: "created_at", lower: "NOW-11MONTH", upper: "NOW-3MONTH" }),
            text(" AND "),
            fieldValue({ field: "project", value: "214246" }),
            text(" "),
            sort({ field: "page_count" }),
          ),
        ),
      ).toBe(
        "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
      );
    });

    it("serializes text with operators and field-values", () => {
      expect(
        serialize(
          doc(
            fieldValue({ field: "user", value: "102112", prefix: "+" }),
            text(' "classified documents" AND '),
            fieldValue({ field: "access", value: "private" }),
            text(" title:Mueller*"),
          ),
        ),
      ).toBe(
        '+user:102112 "classified documents" AND access:private title:Mueller*',
      );
    });
  });

  describe("fragment serialization", () => {
    it("serializes a document fragment", () => {
      const d = doc(
        fieldValue({ field: "user", value: "102112" }),
        text(" AND "),
        fieldValue({ field: "access", value: "private" }),
      );
      // Get the paragraph's content as a fragment
      const fragment = d.child(0).content;
      expect(serialize(fragment)).toBe("user:102112 AND access:private");
    });
  });
});
