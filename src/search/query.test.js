import { parse, highlight } from "./query";

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
});

test("gets highlights", () => {
  expect(highlight("a hi:true b")).toEqual([
    {
      type: "term",
      text: "a "
    },
    {
      type: "field",
      text: "hi"
    },
    {
      type: "raw",
      text: ":"
    },
    {
      type: "term",
      text: "true "
    },
    {
      type: "term",
      text: "b"
    }
  ]);
});
