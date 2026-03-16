/**
 * Parser evaluation tests for the `lucene` npm package.
 *
 * These tests document what the parser handles correctly and where it falls
 * short for DocumentCloud's query syntax. They serve as a permanent record
 * of parser behavior and inform any pre/post-processing we need to add.
 *
 * KEY FINDINGS:
 * - The parser includes +/- prefixes in the field name ("+user" not "user" with prefix "+")
 *   when used with field:value syntax. We must strip prefixes from field names during
 *   deserialization.
 * - NOT as a unary operator uses `start: "NOT"` on the AST, not `operator: "NOT"`.
 * - Range `inclusive` is a string: "both", "none", "left", "right" — not a boolean.
 * - Fuzzy integer edit distance (book~2) normalizes to 0.5; only decimals (book~0.8) work.
 * - Empty/whitespace strings don't throw — they return an empty-ish AST.
 * - Date math with `/` (rounding like NOW/DAY) in ranges causes parse failures.
 * - ISO date strings with colons in ranges fail even when quoted — need pre-processing.
 */
import { describe, it, expect } from "vitest";
import { parse, type NodeTerm, type BinaryAST } from "lucene";

const IMPLICIT = "<implicit>";

describe("lucene parser evaluation", () => {
  describe("standard Lucene syntax", () => {
    it("parses a single term", () => {
      const ast = parse("report");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "report",
      });
    });

    it("parses a quoted phrase", () => {
      const ast = parse('"the mueller report"');
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "the mueller report",
        quoted: true,
      });
    });

    it("parses field:value", () => {
      const ast = parse("user:102112");
      expect(ast.left).toMatchObject({
        field: "user",
        term: "102112",
      });
    });

    it("parses field with quoted value", () => {
      const ast = parse('title:"the mueller report"');
      expect(ast.left).toMatchObject({
        field: "title",
        term: "the mueller report",
        quoted: true,
      });
    });

    it("parses AND operator", () => {
      const ast = parse("mueller AND report");
      expect(ast).toMatchObject({
        left: { field: IMPLICIT, term: "mueller" },
        operator: "AND",
        right: { field: IMPLICIT, term: "report" },
      });
    });

    it("parses OR operator", () => {
      const ast = parse("mueller OR report");
      expect(ast).toMatchObject({
        left: { field: IMPLICIT, term: "mueller" },
        operator: "OR",
        right: { field: IMPLICIT, term: "report" },
      });
    });

    it("parses NOT operator — uses start property, not operator", () => {
      // LIMITATION: NOT as a unary prefix uses `start: "NOT"` on the AST root,
      // not `operator: "NOT"`. This differs from binary operators.
      const ast = parse("NOT mueller");
      expect(ast).toMatchObject({
        start: "NOT",
        left: { field: IMPLICIT, term: "mueller" },
      });
      // There is no `operator` property for unary NOT
      expect((ast as BinaryAST).operator).toBeUndefined();
    });

    it("parses + prefix on bare terms", () => {
      const ast = parse("+mueller");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "mueller",
        prefix: "+",
      });
    });

    it("parses - prefix on bare terms", () => {
      const ast = parse("-report");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "report",
        prefix: "-",
      });
    });

    it("includes + prefix in field name for field:value — needs post-processing", () => {
      // LIMITATION: The parser puts the + into the field name rather than
      // as a separate `prefix` property. We must strip +/- from field names
      // during deserialization.
      const ast = parse("+user:102112");
      expect(ast.left).toMatchObject({
        field: "+user",
        term: "102112",
      });
      // prefix is null, not "+"
      expect((ast.left as NodeTerm).prefix).toBeNull();
    });

    it("parses parenthesized groups", () => {
      const ast = parse("(mueller OR watergate) AND report");
      expect(ast).toMatchObject({
        left: {
          left: { term: "mueller" },
          operator: "OR",
          right: { term: "watergate" },
        },
        operator: "AND",
        right: { term: "report" },
      });
    });

    it("parses inclusive range — inclusive is 'both'", () => {
      const ast = parse("page_count:[10 TO 100]");
      expect(ast.left).toMatchObject({
        field: "page_count",
        term_min: "10",
        term_max: "100",
        inclusive: "both",
      });
    });

    it("parses exclusive range — inclusive is 'none'", () => {
      const ast = parse("page_count:{10 TO 100}");
      expect(ast.left).toMatchObject({
        field: "page_count",
        term_min: "10",
        term_max: "100",
        inclusive: "none",
      });
    });

    it("parses mixed range [min TO max} — inclusive is 'left'", () => {
      // The parser DOES support mixed inclusivity via string values
      const ast = parse("page_count:[10 TO 100}");
      expect(ast.left).toMatchObject({
        field: "page_count",
        term_min: "10",
        term_max: "100",
        inclusive: "left",
      });
    });

    it("parses open-ended range [min TO *]", () => {
      const ast = parse("page_count:[10 TO *]");
      expect(ast.left).toMatchObject({
        field: "page_count",
        term_min: "10",
        term_max: "*",
        inclusive: "both",
      });
    });

    it("parses wildcard term", () => {
      const ast = parse("muell*");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "muell*",
      });
    });

    it("parses fuzzy term — integer edit distance is normalized to 0.5", () => {
      // LIMITATION: book~2 gives similarity 0.5 (default), not 2.
      // The parser only recognizes decimal similarity values like book~0.8.
      const ast = parse("book~2");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "book",
        similarity: 0.5,
      });
    });

    it("parses fuzzy term with decimal similarity", () => {
      const ast = parse("book~0.8");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "book",
        similarity: 0.8,
      });
    });

    it("parses boost", () => {
      const ast = parse("mueller^4");
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "mueller",
        boost: 4,
      });
    });

    it("parses proximity search", () => {
      const ast = parse('"mueller report"~10');
      expect(ast.left).toMatchObject({
        field: IMPLICIT,
        term: "mueller report",
        quoted: true,
        proximity: 10,
      });
    });
  });

  describe("DocumentCloud extensions", () => {
    it("parses sort:field as a regular field:value", () => {
      const ast = parse("sort:created_at");
      expect(ast.left).toMatchObject({
        field: "sort",
        term: "created_at",
      });
    });

    it("parses sort:-field (descending) with prefix on value", () => {
      const ast = parse("sort:-page_count");
      expect(ast.left).toMatchObject({
        field: "sort",
        term: "page_count",
        prefix: "-",
      });
    });

    it("parses data_* fields", () => {
      const ast = parse("data_Folder:test");
      expect(ast.left).toMatchObject({
        field: "data_Folder",
        term: "test",
      });
    });

    it("parses data_* fields with quoted values", () => {
      const ast = parse('data_Folder:"Environmental docs"');
      expect(ast.left).toMatchObject({
        field: "data_Folder",
        term: "Environmental docs",
        quoted: true,
      });
    });

    it("parses slug field with hyphens", () => {
      const ast = parse("slug:the-mueller-report");
      expect(ast.left).toMatchObject({
        field: "slug",
        term: "the-mueller-report",
      });
    });

    it("parses user with slug value", () => {
      const ast = parse("user:mitchell-kotler-1");
      expect(ast.left).toMatchObject({
        field: "user",
        term: "mitchell-kotler-1",
      });
    });
  });

  describe("date math in ranges", () => {
    it("parses date range with NOW", () => {
      const ast = parse("created_at:[NOW-1MONTH TO *]");
      expect(ast.left).toMatchObject({
        field: "created_at",
        term_min: "NOW-1MONTH",
        term_max: "*",
      });
    });

    it("fails to parse quoted ISO dates in ranges — colons cause issues", () => {
      // LIMITATION: Even quoted ISO dates with colons fail inside range syntax.
      // We need to pre-process these before parsing.
      expect(() =>
        parse('created_at:["2024-01-01T00:00:00Z" TO "2024-01-31T00:00:00Z"]'),
      ).toThrow();
    });

    it("parses date ranges with date-only values (no colons)", () => {
      const ast = parse("created_at:[2024-01-01 TO 2024-01-31]");
      expect(ast.left).toMatchObject({
        field: "created_at",
        term_min: "2024-01-01",
        term_max: "2024-01-31",
      });
    });

    it("fails to parse date math with / rounding in ranges", () => {
      // LIMITATION: The / character in date math (e.g., NOW/DAY) causes
      // parse errors inside ranges. We need to pre-process or quote these.
      expect(() => parse("updated_at:[NOW/DAY-7DAYS TO NOW/DAY]")).toThrow();
    });

    it("parses date range with complex date math (no rounding)", () => {
      const ast = parse("created_at:[NOW-11MONTH TO NOW-3MONTH]");
      expect(ast.left).toMatchObject({
        field: "created_at",
        term_min: "NOW-11MONTH",
        term_max: "NOW-3MONTH",
      });
    });
  });

  describe("complex real-world queries", () => {
    it("parses user filter with text search — prefix in field name", () => {
      // LIMITATION: + gets folded into the field name
      const ast = parse("+user:102112 report");
      expect(ast).toMatchObject({
        left: { field: "+user", term: "102112" },
        operator: IMPLICIT,
        right: { field: IMPLICIT, term: "report" },
      });
    });

    it("parses multiple filters with AND — prefix in field name", () => {
      const ast = parse("+user:102112 AND access:private");
      expect(ast).toMatchObject({
        left: { field: "+user", term: "102112" },
        operator: "AND",
        right: { field: "access", term: "private" },
      });
    });

    it("parses complex query with range, filter, and sort", () => {
      const ast = parse(
        "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
      );
      expect(ast).toBeDefined();
      expect(ast.left).toBeDefined();
    });

    it("parses mixed structured and freeform query", () => {
      const ast = parse(
        '+user:102112 "classified documents" AND access:private title:Mueller*',
      );
      expect(ast).toBeDefined();
      expect(ast.left).toBeDefined();
    });

    it("parses grouped OR within AND", () => {
      const ast = parse("(project:45678 OR project:121212) AND report");
      expect(ast).toMatchObject({
        left: {
          left: { field: "project", term: "45678" },
          operator: "OR",
          right: { field: "project", term: "121212" },
        },
        operator: "AND",
        right: { term: "report" },
      });
    });

    it("parses data field with complex quoted value — prefix in field name", () => {
      const ast = parse(
        '+data_Folder:"From ARMY site - Environmental documents" AND +data_Subfolder:38',
      );
      expect(ast).toMatchObject({
        left: {
          field: "+data_Folder",
          term: "From ARMY site - Environmental documents",
          quoted: true,
        },
        operator: "AND",
        right: {
          field: "+data_Subfolder",
          term: "38",
        },
      });
    });

    it("parses access:public with implicit operator", () => {
      const ast = parse("documents access:public");
      expect(ast).toMatchObject({
        left: { field: IMPLICIT, term: "documents" },
        operator: IMPLICIT,
        right: { field: "access", term: "public" },
      });
    });
  });

  describe("edge cases and parser behavior", () => {
    it("returns an AST for empty string (does not throw)", () => {
      // The parser does NOT throw on empty strings — it returns an AST
      const ast = parse("");
      expect(ast).toBeDefined();
    });

    it("returns an AST for whitespace-only string (does not throw)", () => {
      const ast = parse("   ");
      expect(ast).toBeDefined();
    });

    it("handles unbalanced quotes via existing parse wrapper", () => {
      // The raw lucene parser throws on unbalanced quotes.
      // Our parse() wrapper in parse.ts handles this with escaping.
      expect(() => parse('"unbalanced')).toThrow();
    });

    it("handles unbalanced parentheses", () => {
      // Throws on unbalanced parens
      expect(() => parse("(unbalanced")).toThrow();
    });
  });
});
