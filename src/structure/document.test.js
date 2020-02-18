import { transformHighlights, transformPassage } from "./document";

const START = "<em>";
const END = "</em>";

test("highlighting", () => {
  expect(
    transformHighlights(
      {
        page_no_260: ["hi"]
      },
      START,
      END
    )
  ).toEqual([
    {
      page: 259,
      passages: [
        {
          type: "normal",
          text: "hi"
        }
      ]
    }
  ]);
});

test("highlight page ordered", () => {
  expect(
    transformHighlights(
      {
        page_no_2: [],
        page_no_1: []
      },
      START,
      END
    )
  ).toEqual([
    {
      page: 0,
      passages: []
    },
    {
      page: 1,
      passages: []
    }
  ]);

  expect(
    transformHighlights(
      {
        page_no_1: [],
        page_no_2: []
      },
      START,
      END
    )
  ).toEqual([
    {
      page: 0,
      passages: []
    },
    {
      page: 1,
      passages: []
    }
  ]);
});

test("highlight chunking", () => {
  expect(transformPassage("<em>hi</em>", START, END)).toEqual([
    { type: "highlight", text: "hi" }
  ]);

  expect(transformPassage("<em>hi</em> there", START, END)).toEqual([
    { type: "highlight", text: "hi" },
    { type: "normal", text: " there" }
  ]);

  expect(transformPassage("why <em>hi</em> there", START, END)).toEqual([
    { type: "normal", text: "why " },
    { type: "highlight", text: "hi" },
    { type: "normal", text: " there" }
  ]);

  expect(transformPassage("<em>false end<//em>", START, END)).toEqual([
    { type: "normal", text: "<em>false end<//em>" }
  ]);

  expect(transformPassage("1<em>2</em>3<em>4</em>5<em>", START, END)).toEqual([
    { type: "normal", text: "1" },
    { type: "highlight", text: "2" },
    { type: "normal", text: "3" },
    { type: "highlight", text: "4" },
    { type: "normal", text: "5<em>" }
  ]);
});
