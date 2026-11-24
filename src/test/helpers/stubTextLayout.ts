/** Width of one character, in px, in the stubbed layout. */
export const CHAR_WIDTH = 10;
/** Height of one line of text, in px, in the stubbed layout. */
export const LINE_HEIGHT = 20;

/**
 * Give Range a fake text layout, since jsdom implements no Range geometry.
 *
 * Text inside an element with `data-box="left,top"` is laid out from that
 * point at CHAR_WIDTH per character on one LINE_HEIGHT line; any other text
 * has no box. Returns a function that removes the stubs.
 */
export function stubTextLayout() {
  function origin(node: Node): [number, number] | null {
    const box = node.parentElement?.dataset.box;
    if (node.nodeType !== Node.TEXT_NODE || !box) return null;
    const [left, top] = box.split(",").map(Number);
    return [left!, top!];
  }

  Object.defineProperty(Range.prototype, "getClientRects", {
    configurable: true,
    value(this: Range) {
      const start = origin(this.startContainer);
      if (!start || this.collapsed || this.startContainer !== this.endContainer)
        return [];
      const [left, top] = start;
      return [
        new DOMRect(
          left + this.startOffset * CHAR_WIDTH,
          top,
          (this.endOffset - this.startOffset) * CHAR_WIDTH,
          LINE_HEIGHT,
        ),
      ];
    },
  });

  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    configurable: true,
    value(this: Range) {
      const start = origin(this.startContainer);
      const end = origin(this.endContainer);
      if (!start || !end || this.collapsed) return new DOMRect(0, 0, 0, 0);
      const x1 = start[0] + this.startOffset * CHAR_WIDTH;
      const x2 = end[0] + this.endOffset * CHAR_WIDTH;
      const left = Math.min(x1, x2);
      const top = Math.min(start[1], end[1]);
      return new DOMRect(
        left,
        top,
        Math.max(x1, x2) - left,
        Math.max(start[1], end[1]) + LINE_HEIGHT - top,
      );
    },
  });

  return () => {
    delete (Range.prototype as any).getClientRects;
    delete (Range.prototype as any).getBoundingClientRect;
  };
}
