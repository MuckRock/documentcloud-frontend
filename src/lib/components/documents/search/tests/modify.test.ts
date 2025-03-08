import { describe, it, expect } from "vitest";
import { addTerm, removeTerm } from "../modify";
import { toString } from "lucene";
import type { AST, NodeTerm } from "lucene";
import { parse } from "../parse";

describe("Modify search functions", () => {
  describe("addTerm", () => {
    it("should add a term to an empty AST", () => {
      const emptyAst: AST = {};
      const result = addTerm(emptyAst, "field1", "value1");

      expect(result.operator).toBe("<implicit>");
      expect(result.left).toEqual(emptyAst);
      expect(result.right).toMatchObject({
        field: "field1",
        term: "value1",
      });
      expect(toString(result)).toBe(" field1:value1");
    });

    it("should add a term to an existing AST", () => {
      const initialAst: AST = {
        left: {
          field: "existingField",
          term: "existingValue",
        } as NodeTerm,
      };

      const result = addTerm(initialAst, "newField", "newValue");

      expect(result.operator).toBe("<implicit>");
      expect(result.left).toEqual(initialAst);
      expect(result.right).toMatchObject({
        field: "newField",
        term: "newValue",
      });
      expect(toString(result)).toBe(
        "existingField:existingValue newField:newValue",
      );
    });
  });

  describe("removeTerm", () => {
    it("should remove a term with matching field and value", () => {
      const initialAst: AST = {
        left: {
          left: {
            field: "field1",
            term: "value1",
            quoted: false,
            regex: false,
            similarity: null,
            boost: null,
            prefix: null,
          } as NodeTerm,
          operator: "OR",
          right: {
            field: "field3",
            term: "value3",
            quoted: false,
            regex: false,
            similarity: null,
            boost: null,
            prefix: null,
          } as NodeTerm,
          parenthesized: true,
        },
        operator: "AND",
        right: {
          field: "field2",
          term: "value2",
          quoted: false,
          regex: false,
          similarity: null,
          boost: null,
          prefix: null,
        },
      };

      const result = removeTerm(initialAst, "field2", "value2");

      expect(result).toMatchObject({
        left: {
          field: "field1",
          term: "value1",
          quoted: false,
          regex: false,
          similarity: null,
          boost: null,
          prefix: null,
        } as NodeTerm,
        operator: "OR",
        right: {
          field: "field3",
          term: "value3",
          quoted: false,
          regex: false,
          similarity: null,
          boost: null,
          prefix: null,
        } as NodeTerm,
        parenthesized: true,
      });
    });

    it("should remove all terms with matching field when no value is provided", () => {
      const initialAst: AST = {
        left: {
          field: "field1",
          term: "value1",
        } as NodeTerm,
        operator: "AND",
        right: {
          field: "field1",
          term: "value2",
        } as NodeTerm,
      };

      const result = removeTerm(initialAst, "field1");

      expect(result).toBeNull();
    });

    it("should not modify AST when term is not found", () => {
      const initialAst: AST = {
        left: {
          field: "field1",
          term: "value1",
        } as NodeTerm,
      };

      const result = removeTerm(initialAst, "nonexistent", "value");

      expect(result).toEqual(initialAst);
    });

    it("should handle nested AST structures", () => {
      const nestedAst: AST = {
        left: {
          left: {
            field: "field1",
            term: "value1",
          } as NodeTerm,
          operator: "AND",
          right: {
            field: "field2",
            term: "value2",
          } as NodeTerm,
        },
        operator: "OR",
        right: {
          field: "field3",
          term: "value3",
        } as NodeTerm,
      };

      const result = removeTerm(nestedAst, "field2", "value2");

      expect(result).toMatchObject({
        left: {
          field: "field1",
          term: "value1",
        },
        operator: "OR",
        right: {
          field: "field3",
          term: "value3",
        },
      });
    });
  });
});
