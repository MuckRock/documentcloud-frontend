import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock,
} from "vitest";

import { getTextRects, mergeRects, selection, type Rect } from "../selection";
import { stubTextLayout } from "@/test/helpers/stubTextLayout";

const rect = (left: number, top: number, right: number, bottom: number) =>
  ({ left, top, right, bottom }) satisfies Rect;

describe("mergeRects", () => {
  test("collapses duplicate boxes for the same word into one", () => {
    const merged = mergeRects([
      rect(10, 100, 50, 120),
      rect(10, 100, 50, 120),
      rect(9, 99, 51, 121),
    ]);

    expect(merged).toEqual([rect(9, 99, 51, 121)]);
  });

  test("joins words on one line across the space between them", () => {
    const merged = mergeRects([rect(60, 100, 90, 120), rect(10, 100, 50, 120)]);

    expect(merged).toEqual([rect(10, 100, 90, 120)]);
  });

  test("keeps separate lines separate", () => {
    const merged = mergeRects([rect(10, 100, 50, 120), rect(10, 125, 50, 145)]);

    expect(merged).toEqual([rect(10, 100, 50, 120), rect(10, 125, 50, 145)]);
  });

  test("treats boxes with slightly different baselines as one line", () => {
    const merged = mergeRects([rect(10, 100, 50, 120), rect(55, 103, 90, 123)]);

    expect(merged).toEqual([rect(10, 100, 90, 123)]);
  });

  test("returns nothing for no rects", () => {
    expect(mergeRects([])).toEqual([]);
  });
});

describe("getTextRects", () => {
  let unstub: () => void;
  beforeAll(() => (unstub = stubTextLayout()));
  afterAll(() => unstub());

  // Two lines: "Hello world" at y=40 and "again" at y=80, 10px per character.
  function textLayer() {
    const root = window.document.createElement("div");
    root.innerHTML =
      '<span data-box="20,40">Hello</span> <span data-box="80,40">world</span>' +
      '<span data-box="20,80">again</span>';
    const [hello, world, again] = [...root.querySelectorAll("span")].map(
      (span) => span.firstChild!,
    );
    return { root, hello: hello!, world: world!, again: again! };
  }

  test("returns one padded box per selected line", () => {
    const { hello, again } = textLayer();
    const range = window.document.createRange();
    range.setStart(hello, 0);
    range.setEnd(again, 5);

    expect(getTextRects(range)).toEqual([
      rect(19, 39, 131, 61),
      rect(19, 79, 71, 101),
    ]);
  });

  test("covers only the selected characters of the first and last words", () => {
    const { hello, world } = textLayer();
    const range = window.document.createRange();
    range.setStart(hello, 2);
    range.setEnd(world, 3);

    expect(getTextRects(range)).toEqual([rect(39, 39, 111, 61)]);
  });

  test("handles a selection inside a single word", () => {
    const { world } = textLayer();
    const range = window.document.createRange();
    range.setStart(world, 1);
    range.setEnd(world, 4);

    expect(getTextRects(range)).toEqual([rect(89, 39, 121, 61)]);
  });
});

describe("selection attachment", () => {
  let unstub: () => void;
  beforeAll(() => (unstub = stubTextLayout()));
  afterAll(() => unstub());

  let page: HTMLElement;
  let outside: HTMLElement;
  let onChange: Mock<(selection: Range | null) => void>;
  let detach: () => void;

  beforeEach(() => {
    window.document.body.innerHTML =
      '<div id="page"><span data-box="0,0">inside text</span></div>' +
      '<p><span data-box="0,100">outside text</span></p>';
    page = window.document.getElementById("page")!;
    outside = window.document.querySelector("p")!;
    onChange = vi.fn<(selection: Range | null) => void>();
    detach = selection(onChange)(page) as () => void;
    window.getSelection()!.removeAllRanges();

    return () => detach();
  });

  function select(
    start: Node,
    startOffset: number,
    end: Node,
    endOffset: number,
  ) {
    const range = window.document.createRange();
    range.setStart(start, startOffset);
    range.setEnd(end, endOffset);
    window.getSelection()!.addRange(range);
    return range;
  }

  const textOf = (el: Element) => el.querySelector("span")!.firstChild!;
  const pointerUp = () => window.document.dispatchEvent(new Event("pointerup"));
  const selectionChange = () =>
    window.document.dispatchEvent(new Event("selectionchange"));

  test("reports the selected range when the pointer is released", () => {
    const range = select(textOf(page), 0, textOf(page), 6);
    pointerUp();

    expect(onChange).toHaveBeenLastCalledWith(range);
  });

  test("waits for the pointer to be released before reporting a selection", () => {
    select(textOf(page), 0, textOf(page), 6);
    selectionChange();

    expect(onChange).not.toHaveBeenCalled();
  });

  test("reports no selection when it extends outside the page", () => {
    select(textOf(page), 0, textOf(outside), 3);
    pointerUp();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test("reports no selection for a click that selects nothing", () => {
    select(textOf(page), 3, textOf(page), 3);
    pointerUp();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test("clears the selection as soon as it is removed", () => {
    select(textOf(page), 0, textOf(page), 6);
    pointerUp();
    window.getSelection()!.removeAllRanges();
    selectionChange();

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test("stops reporting once detached", () => {
    detach();
    select(textOf(page), 0, textOf(page), 6);
    pointerUp();

    expect(onChange).not.toHaveBeenCalled();
  });
});
