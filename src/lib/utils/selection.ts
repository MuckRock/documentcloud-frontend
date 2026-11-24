import type { Attachment } from "svelte/attachments";

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Get client rects covering the selected text in a range.
 */
export function getTextRects(range: Range): Rect[] {
  const root = range.commonAncestorContainer;
  const rects: Rect[] = [];

  const walker = window.document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null =
    root.nodeType === Node.TEXT_NODE ? root : walker.nextNode();

  while (node) {
    if (range.intersectsNode(node)) {
      const part = window.document.createRange();
      part.selectNodeContents(node);
      if (node === range.startContainer) {
        part.setStart(node, range.startOffset);
      }
      if (node === range.endContainer) part.setEnd(node, range.endOffset);

      for (const r of part.getClientRects()) {
        if (r.width > 0 && r.height > 0) rects.push(r);
      }
    }
    node = walker.nextNode();
  }

  return mergeRects(rects).map((r) => padRect(r));
}

/**
 * Pad a rect by a given pixel size.
 */
function padRect(rect: Rect, pad = 1): Rect {
  return {
    left: rect.left - pad,
    top: rect.top - pad,
    right: rect.right + pad,
    bottom: rect.bottom + pad,
  };
}

/**
 * Merge rects that sit on the same line and overlap.
 */
export function mergeRects(rects: Rect[]): Rect[] {
  const lines: Rect[][] = [];

  for (const rect of rects) {
    const line = lines.find((l) => sameLine(l[0]!, rect));
    if (line) line.push(rect);
    else lines.push([rect]);
  }

  return lines.flatMap((line) => {
    const sorted = [...line].sort((a, b) => a.left - b.left);
    const merged: Rect[] = [copyRect(sorted[0]!)];

    for (const rect of sorted.slice(1)) {
      const last = merged.at(-1)!;
      const tolerance = (last.bottom - last.top) / 2;
      if (rect.left <= last.right + tolerance) {
        last.right = Math.max(last.right, rect.right);
        last.top = Math.min(last.top, rect.top);
        last.bottom = Math.max(last.bottom, rect.bottom);
      } else {
        merged.push(copyRect(rect));
      }
    }

    return merged;
  });
}

function copyRect({ left, top, right, bottom }: Rect): Rect {
  return { left, top, right, bottom };
}

/** Do two rects share at least half the height of the shorter one? */
function sameLine(a: Rect, b: Rect): boolean {
  const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  const shorter = Math.min(a.bottom - a.top, b.bottom - b.top);
  return overlap >= shorter / 2;
}

export function selection(
  onChange: (selection: Range | null) => void,
): Attachment<HTMLElement> {
  return (element) => {
    // Only send a new selection when the user releases the pointer
    // The start and end of the selection must both be within the target page
    function onPointerUp() {
      const selection = window.document.getSelection();
      if (
        !selection ||
        !element.contains(selection.anchorNode) ||
        !element.contains(selection.focusNode)
      ) {
        return onChange(null);
      }
      const range = selection.getRangeAt(0);
      const { width } = range.getBoundingClientRect();
      return onChange(width > 0 ? range : null);
    }

    // Potentially clear the selection anytime it changes
    function onSelectionChange() {
      const selection = window.document.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return onChange(null);
      }
      const range = selection.getRangeAt(0);
      const { width } = range.getBoundingClientRect();
      if (width === 0) {
        return onChange(null);
      }
    }

    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  };
}
