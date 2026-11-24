import type { Attachment } from "svelte/attachments";

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
