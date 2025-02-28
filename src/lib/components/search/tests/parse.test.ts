import { expect, test } from "vitest";
import { parse, highlight, splitAndEscape } from "../parse.js";

const IMPLICIT = "<implicit>";

test("parses valid query", () => {
  expect(parse("user:123")).toMatchObject({
    left: {
      field: "user",
      term: "123",
    },
  });
});

test("parses invalid query", () => {
  expect(parse(`hello "`)).toMatchObject({
    left: {
      field: IMPLICIT,
      term: "hello",
    },
    operator: IMPLICIT,
    right: {
      field: IMPLICIT,
      term: `\\"`,
    },
  });
});

test("maps parse positions for escaped query", () => {
  expect(parse(`" dog`)).toMatchObject({
    left: {
      field: IMPLICIT,
      term: '\\"',
      termLocation: {
        start: {
          offset: 0,
        },
        end: {
          offset: 1,
        },
      },
    },
    operator: IMPLICIT,
    right: {
      field: IMPLICIT,
      term: "dog",
      termLocation: {
        start: {
          offset: 2,
        },
        end: {
          offset: 5,
        },
      },
    },
  });

  expect(parse(`(a:b`)).toMatchObject({
    left: {
      field: "a",
      term: "b",
      fieldLocation: {
        start: {
          offset: 1,
        },
      },
    },
  });
});

test("gets highlights", () => {
  expect(highlight("a title:true b")).toEqual([
    {
      type: "raw",
      text: "a ",
    },
    {
      type: "field",
      text: "title:true",
      field: "title:",
      value: "true",
    },
    {
      type: "raw",
      text: " b",
    },
  ]);
});

test("highlight parens", () => {
  expect(highlight("title:(a AND b)")).toEqual([
    {
      type: "field",
      text: "title:(a AND b)",
      field: "title:",
      value: "(a AND b)",
    },
  ]);

  expect(highlight("title:(a AND b )")).toEqual([
    {
      type: "field",
      text: "title:(a AND b )",
      field: "title:",
      value: "(a AND b )",
    },
  ]);

  expect(highlight("title:(a AND b) other")).toEqual([
    {
      type: "field",
      text: "title:(a AND b)",
      field: "title:",
      value: "(a AND b)",
    },
    {
      type: "raw",
      text: " other",
    },
  ]);
});

test("gets data highlights", () => {
  expect(highlight("data_hi:there")).toEqual([
    {
      type: "field",
      text: "data_hi:there",
      field: "data_hi:",
      value: "there",
    },
  ]);
});

test("gets range highlights", () => {
  expect(highlight("page_count:10")).toEqual([
    {
      type: "field",
      text: "page_count:10",
      field: "page_count:",
      value: "10",
    },
  ]);

  expect(highlight("page_count:[10 TO *]")).toEqual([
    {
      type: "field",
      text: "page_count:[10 TO *]",
      field: "page_count:",
      value: "[10 TO *]",
    },
  ]);

  expect(highlight("page_count:[10 TO *}")).toEqual([
    {
      type: "field",
      text: "page_count:[10 TO *}",
      field: "page_count:",
      value: "[10 TO *}",
    },
  ]);

  expect(highlight("page_count:{10 TO 120}")).toEqual([
    {
      type: "field",
      text: "page_count:{10 TO 120}",
      field: "page_count:",
      value: "{10 TO 120}",
    },
  ]);

  expect(highlight("page_count:{* TO 120]")).toEqual([
    {
      type: "field",
      text: "page_count:{* TO 120]",
      field: "page_count:",
      value: "{* TO 120]",
    },
  ]);
});

test("quote highlights", () => {
  expect(highlight(`"quoted phrase"`)).toEqual([
    {
      type: "quote",
      text: `"quoted phrase"`,
      field: null,
      value: null,
    },
  ]);

  expect(highlight(`a "quoted phrase" b`)).toEqual([
    {
      type: "raw",
      text: "a ",
    },
    {
      type: "quote",
      text: `"quoted phrase"`,
      field: null,
      value: null,
    },
    {
      type: "raw",
      text: " b",
    },
  ]);

  expect(highlight(`"imbalanced`)).toEqual([
    {
      type: "raw",
      text: `"imbalanced`,
    },
  ]);
});

test("operator highlights", () => {
  expect(highlight(`a AND b`)).toEqual([
    {
      type: "raw",
      text: "a ",
    },
    {
      type: "operator",
      text: "AND",
    },
    {
      type: "raw",
      text: " b",
    },
  ]);

  expect(highlight(`a OR b`)).toEqual([
    {
      type: "raw",
      text: "a ",
    },
    {
      type: "operator",
      text: "OR",
    },
    {
      type: "raw",
      text: " b",
    },
  ]);

  expect(highlight(`NOT b`)).toEqual([
    {
      type: "operator",
      text: "NOT",
    },
    {
      type: "raw",
      text: " b",
    },
  ]);

  expect(highlight("(a OR b) AND (c OR d)")).toEqual([
    {
      type: "raw",
      text: "(a ",
    },
    {
      type: "operator",
      text: "OR",
    },
    {
      type: "raw",
      text: " b) ",
    },
    {
      type: "operator",
      text: "AND",
    },
    {
      type: "raw",
      text: " (c ",
    },
    {
      type: "operator",
      text: "OR",
    },
    {
      type: "raw",
      text: " d)",
    },
  ]);

  expect(highlight(`"a AND b"`)).toEqual([
    {
      type: "quote",
      text: `"a AND b"`,
      field: null,
      value: null,
    },
  ]);
});

test("split and escape", () => {
  // Test cases copied from backend
  const cases = [
    ["foo:bar (", "foo:bar \\("],
    ["foo:bar :foo", "foo:bar \\:foo"],
    ["foo:bar foo:", "foo:bar foo\\:"],
    ["foo:bar :", "foo:bar \\:"],
    ["foo:bar+baz", "foo:bar\\+baz"],
    ["foo (", "foo \\("],
    ["foo )", "foo \\)"],
    ["foo [", "foo \\["],
    ["foo ]", "foo \\]"],
    ["foo {", "foo \\{"],
    ["foo }", "foo \\}"],
    ["foo ~", "foo \\~"],
    ["foo ^", "foo \\^"],
    ["foo + ", "foo \\+"],
    ["foo - ", "foo \\-"],
    ["foo !", "foo \\!"],
    ["foo /", "foo \\/"],
    ["foo \\", "foo \\\\"],
    ['foo "', 'foo \\"'],
    ["foo + AND", 'foo \\+ "AND"'],
    ["foo AND", 'foo "AND"'],
    ["foo OR", 'foo "OR"'],
    ["foo NOT", 'foo "NOT"'],
    ['foo "(" )', 'foo "(" \\)'],
    ['foo "(" "', 'foo \\"\\(\\" \\"'],
    [
      "foo:foo AND (:bar OR baz:) (qux:qux AND",
      'foo:foo "AND" \\(\\:bar "OR" baz:\\) qux:qux "AND"',
    ],
  ];

  cases.forEach(([query, expectation]) => {
    const escaped = splitAndEscape(query!).escaped.trim();
    expect(escaped).toBe(expectation);
  });
});
