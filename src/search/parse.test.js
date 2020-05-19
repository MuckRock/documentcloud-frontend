import { parse, highlight, splitAndEscape } from "./parse";

const IMPLICIT = "<implicit>";

test("parses valid query", () => {
  expect(parse("user:123")).toMatchObject({
    left: {
      field: "user",
      term: "123"
    }
  });
});

test("parses invalid query", () => {
  expect(parse(`hello "`)).toMatchObject({
    left: {
      field: IMPLICIT,
      term: "hello"
    },
    operator: IMPLICIT,
    right: {
      field: IMPLICIT,
      term: `\\"`
    }
  });
});

test("maps parse positions for escaped query", () => {
  expect(parse(`" dog`)).toMatchObject({
    left: {
      field: IMPLICIT,
      term: '\\"',
      termLocation: {
        start: {
          offset: 0
        },
        end: {
          offset: 1
        }
      }
    },
    operator: IMPLICIT,
    right: {
      field: IMPLICIT,
      term: "dog",
      termLocation: {
        start: {
          offset: 2
        },
        end: {
          offset: 5
        }
      }
    }
  });

  expect(parse(`(a:b`)).toMatchObject({
    left: {
      field: "a",
      term: "b",
      fieldLocation: {
        start: {
          offset: 1
        }
      }
    }
  });
});

test("gets highlights", () => {
  expect(highlight("a title:true b")).toEqual([
    {
      type: "raw",
      text: "a "
    },
    {
      type: "field",
      text: "title:true",
      field: "title:",
      value: "true"
    },
    {
      type: "raw",
      text: " b"
    }
  ]);
});

test("highlight parens", () => {
  expect(highlight("title:(a AND b)")).toEqual([
    {
      type: "field",
      text: "title:(a AND b)",
      field: "title:",
      value: "(a AND b)"
    }
  ]);

  expect(highlight("title:(a AND b )")).toEqual([
    {
      type: "field",
      text: "title:(a AND b )",
      field: "title:",
      value: "(a AND b )"
    }
  ]);

  expect(highlight("title:(a AND b) other")).toEqual([
    {
      type: "field",
      text: "title:(a AND b)",
      field: "title:",
      value: "(a AND b)"
    },
    {
      type: "raw",
      text: " other"
    }
  ]);
});

test("gets data highlights", () => {
  expect(highlight("data_hi:there")).toEqual([
    {
      type: "field",
      text: "data_hi:there",
      field: "data_hi:",
      value: "there"
    }
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
    const escaped = splitAndEscape(query).escaped.trim();
    expect(escaped).toBe(expectation);
  });
})
