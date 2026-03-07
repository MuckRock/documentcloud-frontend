import { describe, it, expect } from "vitest";
import { searchSchema } from "../schema";
import { serialize } from "../pm-serialize";
import { deserialize } from "../pm-deserialize";
import type { Node as ProseMirrorNode } from "prosemirror-model";

/** Helper to extract the inline content of the first paragraph as an array of node descriptions */
function describeDoc(doc: ProseMirrorNode): Array<Record<string, unknown>> {
  const result: Array<Record<string, unknown>> = [];
  const para = doc.child(0);
  para.forEach((node) => {
    if (node.isText) {
      result.push({ type: "text", text: node.text });
    } else {
      result.push({ type: node.type.name, attrs: { ...node.attrs } });
    }
  });
  return result;
}

describe("deserialize", () => {
  describe("text-only queries", () => {
    it("deserializes a single term as text", () => {
      const doc = deserialize("report");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([{ type: "text", text: "report" }]);
    });

    it("deserializes a quoted phrase as text", () => {
      const doc = deserialize('"steve jobs" macintosh');
      const nodes = describeDoc(doc);
      // The entire string should be plain text
      expect(nodes.length).toBeGreaterThanOrEqual(1);
      expect(serialize(doc)).toBe('"steve jobs" macintosh');
    });

    it("deserializes an empty string as an empty paragraph", () => {
      const doc = deserialize("");
      const para = doc.child(0);
      expect(para.childCount).toBe(0);
    });

    it("deserializes whitespace-only as an empty paragraph", () => {
      const doc = deserialize("   ");
      expect(serialize(doc).trim()).toBe("");
    });
  });

  describe("field-value nodes", () => {
    it("deserializes user:102112 as a field-value chip", () => {
      const doc = deserialize("user:102112");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "user",
            value: "102112",
          }),
        },
      ]);
    });

    it("deserializes +user:102112 with prefix stripped from field name", () => {
      const doc = deserialize("+user:102112");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "user",
            value: "102112",
            prefix: "+",
          }),
        },
      ]);
    });

    it("deserializes -access:private with prefix", () => {
      const doc = deserialize("-access:private");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "access",
            value: "private",
            prefix: "-",
          }),
        },
      ]);
    });

    it("deserializes access:public as a field-value chip", () => {
      const doc = deserialize("access:public");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "access",
            value: "public",
          }),
        },
      ]);
    });

    it("deserializes project with slug value", () => {
      const doc = deserialize("project:panama-papers-1");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "project",
            value: "panama-papers-1",
          }),
        },
      ]);
    });

    it("deserializes organization:1 as a field-value chip", () => {
      const doc = deserialize("organization:1");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "organization",
            value: "1",
          }),
        },
      ]);
    });

    it("deserializes status:success as a field-value chip", () => {
      const doc = deserialize("status:success");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "status",
            value: "success",
          }),
        },
      ]);
    });

    it("deserializes language:eng as a field-value chip", () => {
      const doc = deserialize("language:eng");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "language",
            value: "eng",
          }),
        },
      ]);
    });

    it("deserializes tag:significant as a field-value chip", () => {
      const doc = deserialize("tag:significant");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "tag",
            value: "significant",
          }),
        },
      ]);
    });

    it("deserializes document:20059100 as a field-value chip", () => {
      const doc = deserialize("document:20059100");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "field-value",
          attrs: expect.objectContaining({
            field: "document",
            value: "20059100",
          }),
        },
      ]);
    });
  });

  describe("plain text fields (not chipped)", () => {
    it("deserializes title:Mueller* as plain text", () => {
      const doc = deserialize("title:Mueller*");
      expect(serialize(doc)).toBe("title:Mueller*");
      const nodes = describeDoc(doc);
      expect(nodes.every((n) => n.type === "text")).toBe(true);
    });

    it("deserializes description:report as plain text", () => {
      const doc = deserialize("description:report");
      expect(serialize(doc)).toBe("description:report");
    });

    it("deserializes text:Russian as plain text", () => {
      const doc = deserialize("text:Russian");
      expect(serialize(doc)).toBe("text:Russian");
    });

    it("deserializes source:gema as plain text", () => {
      const doc = deserialize("source:gema");
      expect(serialize(doc)).toBe("source:gema");
    });

    it("deserializes data_Folder:test as plain text", () => {
      const doc = deserialize("data_Folder:test");
      expect(serialize(doc)).toBe("data_Folder:test");
    });

    it('deserializes data_Folder:"Environmental docs" as plain text', () => {
      const doc = deserialize('data_Folder:"Environmental docs"');
      expect(serialize(doc)).toBe('data_Folder:"Environmental docs"');
    });

    it("deserializes slug:the-mueller-report as plain text", () => {
      const doc = deserialize("slug:the-mueller-report");
      expect(serialize(doc)).toBe("slug:the-mueller-report");
    });
  });

  describe("range nodes", () => {
    it("deserializes inclusive range", () => {
      const doc = deserialize("created_at:[NOW-1MONTH TO *]");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "range",
          attrs: expect.objectContaining({
            field: "created_at",
            lower: "NOW-1MONTH",
            upper: "*",
            inclusiveLower: true,
            inclusiveUpper: true,
          }),
        },
      ]);
    });

    it("deserializes exclusive range", () => {
      const doc = deserialize("page_count:{10 TO 100}");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "range",
          attrs: expect.objectContaining({
            field: "page_count",
            lower: "10",
            upper: "100",
            inclusiveLower: false,
            inclusiveUpper: false,
          }),
        },
      ]);
    });

    it("deserializes mixed range [min TO max}", () => {
      const doc = deserialize("page_count:[10 TO 100}");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "range",
          attrs: expect.objectContaining({
            field: "page_count",
            inclusiveLower: true,
            inclusiveUpper: false,
          }),
        },
      ]);
    });

    it("deserializes date range with complex date math", () => {
      const doc = deserialize("created_at:[NOW-11MONTH TO NOW-3MONTH]");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "range",
          attrs: expect.objectContaining({
            field: "created_at",
            lower: "NOW-11MONTH",
            upper: "NOW-3MONTH",
          }),
        },
      ]);
    });

    it("deserializes range with prefix", () => {
      const doc = deserialize("+page_count:[10 TO 100]");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "range",
          attrs: expect.objectContaining({
            field: "page_count",
            prefix: "+",
          }),
        },
      ]);
    });
  });

  describe("sort nodes", () => {
    it("deserializes sort:created_at as ascending sort", () => {
      const doc = deserialize("sort:created_at");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "sort",
          attrs: expect.objectContaining({
            field: "created_at",
            direction: "asc",
          }),
        },
      ]);
    });

    it("deserializes sort:-page_count as descending sort", () => {
      const doc = deserialize("sort:-page_count");
      const nodes = describeDoc(doc);
      expect(nodes).toEqual([
        {
          type: "sort",
          attrs: expect.objectContaining({
            field: "page_count",
            direction: "desc",
          }),
        },
      ]);
    });
  });

  describe("boolean operators and grouping", () => {
    it("preserves AND as text between terms", () => {
      const doc = deserialize("mueller AND report");
      expect(serialize(doc)).toBe("mueller AND report");
    });

    it("preserves OR as text", () => {
      const doc = deserialize("mueller OR report");
      expect(serialize(doc)).toBe("mueller OR report");
    });

    it("preserves NOT as text", () => {
      const doc = deserialize("NOT mueller");
      expect(serialize(doc)).toBe("NOT mueller");
    });

    it("preserves parenthesized groups as text", () => {
      const doc = deserialize("(mueller OR watergate) AND report");
      expect(serialize(doc)).toBe("(mueller OR watergate) AND report");
    });

    it("preserves AND between field-value chips", () => {
      const doc = deserialize("+user:102112 AND access:private");
      const nodes = describeDoc(doc);
      // Should have: field-value, text(" AND "), field-value
      expect(nodes.length).toBe(3);
      expect(nodes[0].type).toBe("field-value");
      expect(nodes[1]).toEqual({ type: "text", text: " AND " });
      expect(nodes[2].type).toBe("field-value");
    });
  });

  describe("mixed queries", () => {
    it("deserializes user filter with text search", () => {
      const doc = deserialize("+user:102112 report");
      const nodes = describeDoc(doc);
      expect(nodes.length).toBe(2);
      expect(nodes[0].type).toBe("field-value");
      expect(nodes[1]).toEqual({ type: "text", text: " report" });
    });

    it("deserializes complex query with range, filter, and sort", () => {
      const doc = deserialize(
        "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
      );
      const nodes = describeDoc(doc);
      const types = nodes.map((n) => n.type);
      expect(types).toContain("field-value");
      expect(types).toContain("range");
      expect(types).toContain("sort");
    });

    it("deserializes mixed structured and freeform query", () => {
      const doc = deserialize(
        '+user:102112 "classified documents" AND access:private title:Mueller*',
      );
      const nodes = describeDoc(doc);
      // user chip, text, access chip, text for title:Mueller*
      const fieldValues = nodes.filter((n) => n.type === "field-value");
      const texts = nodes.filter((n) => n.type === "text");
      expect(fieldValues.length).toBe(2); // user + access
      expect(texts.length).toBeGreaterThanOrEqual(2); // quoted phrase, AND, title:...
    });

    it("keeps data_* fields as plain text in mixed queries", () => {
      const doc = deserialize(
        '+data_Folder:"From ARMY site" AND +data_Subfolder:38',
      );
      expect(serialize(doc)).toBe(
        '+data_Folder:"From ARMY site" AND +data_Subfolder:38',
      );
    });
  });

  describe("round-trip: serialize → deserialize → serialize", () => {
    const roundTrip = (query: string) => serialize(deserialize(query));

    it("round-trips a simple term", () => {
      expect(roundTrip("report")).toBe("report");
    });

    it("round-trips a field-value", () => {
      expect(roundTrip("user:102112")).toBe("user:102112");
    });

    it("round-trips a prefixed field-value", () => {
      expect(roundTrip("+user:102112")).toBe("+user:102112");
    });

    it("round-trips a range", () => {
      expect(roundTrip("created_at:[NOW-1MONTH TO *]")).toBe(
        "created_at:[NOW-1MONTH TO *]",
      );
    });

    it("round-trips a sort", () => {
      expect(roundTrip("sort:-page_count")).toBe("sort:-page_count");
    });

    it("round-trips a complex mixed query", () => {
      expect(roundTrip("+user:102112 AND access:private")).toBe(
        "+user:102112 AND access:private",
      );
    });

    it("round-trips operators", () => {
      expect(roundTrip("mueller AND report")).toBe("mueller AND report");
    });

    it("round-trips parenthesized groups", () => {
      expect(roundTrip("(mueller OR watergate) AND report")).toBe(
        "(mueller OR watergate) AND report",
      );
    });

    it("round-trips plain text fields", () => {
      expect(roundTrip("title:Mueller*")).toBe("title:Mueller*");
    });
  });

  describe("edge cases", () => {
    it("handles parser failure by falling back to plain text", () => {
      // Unbalanced quotes should fall back to plain text
      const doc = deserialize('"unbalanced');
      expect(doc).toBeDefined();
      expect(doc.childCount).toBeGreaterThan(0);
    });

    it("handles boost on field-value", () => {
      const doc = deserialize("user:102112^4");
      const nodes = describeDoc(doc);
      expect(nodes[0]).toEqual({
        type: "field-value",
        attrs: expect.objectContaining({
          field: "user",
          value: "102112",
          boost: 4,
        }),
      });
    });

    it("handles + and - prefix on bare terms as text", () => {
      const doc = deserialize("+mueller -report");
      expect(serialize(doc)).toBe("+mueller -report");
    });

    it("handles wildcard terms as text", () => {
      const doc = deserialize("muell*");
      expect(serialize(doc)).toBe("muell*");
    });

    it("handles quoted field-value", () => {
      const doc = deserialize('access:"public"');
      const nodes = describeDoc(doc);
      expect(nodes[0]).toEqual({
        type: "field-value",
        attrs: expect.objectContaining({
          field: "access",
          value: "public",
          quoted: true,
        }),
      });
    });
  });
});
