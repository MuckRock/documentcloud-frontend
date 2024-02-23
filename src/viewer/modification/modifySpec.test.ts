import {
  runify,
  PageSpec,
  Empty,
  ModificationSpec,
  ROTATE,
  CLOCKWISE,
  COUNTER_CLOCKWISE,
  HALFWAY,
} from "./modifySpec";

function runspec(pgNumbers) {
  return runify(pgNumbers).spec();
}

function getNumbers(spec) {
  return PageSpec.parse(spec).toNumbers();
}

function getLength(spec) {
  return PageSpec.parse(spec).length();
}

function getIndex(spec, i) {
  return PageSpec.parse(spec).index(i);
}

function slice(spec, i, l) {
  return PageSpec.parse(spec).slice(i, l).toNumbers();
}

function sliceSpec(spec, i, l) {
  return PageSpec.parse(spec).slice(i, l).spec();
}

function concatSpec(...specs) {
  return specs
    .reduce(
      (prev, current) => prev.concat(PageSpec.parse(current)),
      new PageSpec([new Empty()]),
    )
    .spec();
}

function removeSpec(spec, other) {
  return PageSpec.parse(spec).remove(PageSpec.parse(other)).spec();
}

test("basic page spec", () => {
  expect(runspec([])).toBe("");
  expect(runspec([1])).toBe("1");
  expect(runspec([1, 2, 3])).toBe("1-3");
  expect(runspec([1, 3])).toBe("1,3");
  expect(runspec([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1])).toBe("1,3-4,7-9,1-5,1");
});

test("page spec to numbers", () => {
  expect(runify([]).toNumbers()).toEqual([]);
  expect(runify([1]).toNumbers()).toEqual([1]);
  expect(runify([1, 2, 3]).toNumbers()).toEqual([1, 2, 3]);
  expect(runify([1, 3]).toNumbers()).toEqual([1, 3]);
  expect(runify([1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1]).toNumbers()).toEqual([
    1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1,
  ]);
});

test("parse page spec", () => {
  expect(getNumbers("")).toEqual([]);
  expect(getNumbers("1")).toEqual([1]);
  expect(getNumbers("1-3")).toEqual([1, 2, 3]);
  expect(getNumbers("1,3")).toEqual([1, 3]);
  expect(getNumbers("1,3-4,7-9,1-5,1")).toEqual([
    1, 3, 4, 7, 8, 9, 1, 2, 3, 4, 5, 1,
  ]);
});

test("length page spec", () => {
  expect(getLength("")).toBe(0);
  expect(getLength("1")).toBe(1);
  expect(getLength("1-3")).toBe(3);
  expect(getLength("1,3")).toBe(2);
  expect(getLength("1,3-4,7-9,1-5,1")).toBe(12);
});

test("index page spec", () => {
  expect(getIndex("1", 0)).toBe(1);
  expect(getIndex("1-3", 0)).toBe(1);
  expect(getIndex("1-3", 1)).toBe(2);
  expect(getIndex("1-3", 2)).toBe(3);
  expect(getIndex("1,3", 0)).toBe(1);
  expect(getIndex("1,3", 1)).toBe(3);
  expect(getIndex("1,3-4,7-9,1-5,1", 0)).toBe(1);
  expect(getIndex("1,3-4,7-9,1-5,1", 1)).toBe(3);
  expect(getIndex("1,3-4,7-9,1-5,1", 2)).toBe(4);
  expect(getIndex("1,3-4,7-9,1-5,1", 3)).toBe(7);
  expect(getIndex("1,3-4,7-9,1-5,1", 4)).toBe(8);
  expect(getIndex("1,3-4,7-9,1-5,1", 5)).toBe(9);
  expect(getIndex("1,3-4,7-9,1-5,1", 6)).toBe(1);
  expect(getIndex("1,3-4,7-9,1-5,1", 7)).toBe(2);
  expect(getIndex("1,3-4,7-9,1-5,1", 8)).toBe(3);
  expect(getIndex("1,3-4,7-9,1-5,1", 9)).toBe(4);
  expect(getIndex("1,3-4,7-9,1-5,1", 10)).toBe(5);
  expect(getIndex("1,3-4,7-9,1-5,1", 11)).toBe(1);
});

test("slice test page spec", () => {
  expect(slice("1-3", 1, 1)).toEqual([2]);
  expect(slice("1-3", 0, 2)).toEqual([1, 2]);
  expect(slice("1-3", 2, 0)).toEqual([]);
  expect(slice("1", 0, 1)).toEqual([1]);
  expect(slice("1", 0, 0)).toEqual([]);
  expect(slice("1-3,10-13", 0, 3)).toEqual([1, 2, 3]);
  expect(slice("1-3,10-13", 0, 6)).toEqual([1, 2, 3, 10, 11, 12]);
  expect(slice("1-3,10-13", 1, 4)).toEqual([2, 3, 10, 11]);
  expect(slice("1,3-4,7-9,1-5,1", 4, 6)).toEqual([8, 9, 1, 2, 3, 4]);
  expect(slice("1-3,4,5", 2, 3)).toEqual([3, 4, 5]);
});

test("slice page spec", () => {
  expect(sliceSpec("1-3,4,5", 2, 3)).toBe("3-5");
  expect(sliceSpec("1-3,4,5", 1, 1)).toBe("2");
  expect(sliceSpec("1-3,4,5", 1, 2)).toBe("2-3");
  expect(sliceSpec("1,3-4,7-9,1-5,1", 4, 6)).toBe("8-9,1-4");
  expect(sliceSpec("1,3-4,7-9,1-5,1", 4, 8)).toBe("8-9,1-5,1");
  expect(sliceSpec("", 0, 0)).toBe("");
  expect(sliceSpec("1-100", 0, 0)).toBe("");
  expect(sliceSpec("1-100,1-100", 50, 100)).toBe("51-100,1-50");
});

test("concat page spec", () => {
  expect(concatSpec("1-3", "4-6")).toBe("1-6");
  expect(concatSpec("1", "2", "3", "4")).toBe("1-4");
  expect(concatSpec("1", "2-3", "4-5", "6", "7-8", "9")).toBe("1-9");
  expect(concatSpec("1", "2-3", "4-5", "7-8", "9")).toBe("1-5,7-9");
  expect(concatSpec("1", "2-3", "4-5", "7-8", "9", "11")).toBe("1-5,7-9,11");
});

test("over-long slice page spec", () => {
  expect(sliceSpec("1-3,4,5", 0, 100)).toBe("1-5");
  expect(sliceSpec("", 0, 5)).toBe("");
  expect(sliceSpec("1-3", 0, 4)).toBe("1-3");
  expect(sliceSpec("1-100,1-100", 50, 500)).toBe("51-100,1-100");
});

test("remove page spec", () => {
  expect(removeSpec("1-3,4,5", "0-2")).toBe("4-5");
  expect(removeSpec("1-3,4,5", "0,3")).toBe("2-3,5");
  expect(removeSpec("1-3,4,5", "2-3")).toBe("1-2,5");
  expect(removeSpec("1-3,4,5", "1-4")).toBe("1");
  expect(removeSpec("1-3,4,5", "0-3")).toBe("5");
});

test("multidocument slice", () => {
  const m = ModificationSpec.parse([
    { page: "0-447" },
    {
      page: "0-49",
      id: "2000000",
    },
  ]);
  expect(m.slice(400, 80).json()).toEqual([
    {
      page: "400-447",
    },
    {
      page: "0-31",
      id: "2000000",
    },
  ]);
});

test("compress", () => {
  const m = ModificationSpec.parse([
    {
      page: "0-5",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
    {
      page: "6-7,9",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
    {
      page: "10",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
    {
      page: "15",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: COUNTER_CLOCKWISE,
        },
      ],
    },
    {
      page: "20",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
  ]);
  expect(m.compress().json()).toEqual([
    {
      page: "0-7,9-10",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
    {
      page: "15",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: COUNTER_CLOCKWISE,
        },
      ],
    },
    {
      page: "20",
      id: "10",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
  ]);
});

test("remove pages", () => {
  const m = ModificationSpec.parse([
    {
      page: "0-3,5,2",
    },
    {
      page: "0,5",
      modifications: [
        {
          type: ROTATE,
          angle: COUNTER_CLOCKWISE,
        },
      ],
    },
    {
      page: "10",
    },
  ]);
  expect(m.remove(PageSpec.parse("5-7")).json()).toEqual([
    {
      page: "0-3,5,10",
    },
  ]);

  expect(m.remove(PageSpec.parse("4-6")).json()).toEqual([
    {
      page: "0-3",
    },
    {
      page: "5",
      modifications: [
        {
          type: ROTATE,
          angle: COUNTER_CLOCKWISE,
        },
      ],
    },
    { page: "10" },
  ]);
});

test("rotate page", () => {
  const m = ModificationSpec.getDocument(3);

  expect(m.json()).toEqual([{ page: "0-2" }]);

  const firstPage = PageSpec.parse("0");
  const cc = m.applyModification((x) => x.rotate(CLOCKWISE), firstPage);

  expect(cc.json()).toEqual([
    {
      page: "0",
      modifications: [
        {
          type: ROTATE,
          angle: CLOCKWISE,
        },
      ],
    },
    { page: "1-2" },
  ]);

  const hw = cc.applyModification((x) => x.rotate(CLOCKWISE), firstPage);

  expect(hw.json()).toEqual([
    {
      page: "0",
      modifications: [
        {
          type: ROTATE,
          angle: HALFWAY,
        },
      ],
    },
    { page: "1-2" },
  ]);

  const ccw = hw.applyModification((x) => x.rotate(CLOCKWISE), firstPage);

  expect(ccw.json()).toEqual([
    {
      page: "0",
      modifications: [
        {
          type: ROTATE,
          angle: COUNTER_CLOCKWISE,
        },
      ],
    },
    { page: "1-2" },
  ]);

  const m2 = ccw.applyModification((x) => x.rotate(CLOCKWISE), firstPage);

  expect(m2.json()).toEqual([
    {
      page: "0-2",
    },
  ]);
});
