/**
 * ProseMirror keymap plugin for keyboard navigation around atom nodes (chips).
 *
 * - ArrowLeft/Right: select an adjacent atom instead of jumping over it
 * - ArrowDown: move focus into a chip's popover editor (if open)
 */
import { NodeSelection, TextSelection, type Command } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";

const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

/**
 * Arrow-left: if the cursor (empty TextSelection) is immediately
 * after a chip node, select it instead of jumping over it.
 */
const arrowLeftIntoAtom: Command = (state, dispatch) => {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || !selection.empty) return false;
  const { $from } = selection;
  const before = $from.nodeBefore;
  if (!before || !ATOM_TYPES.has(before.type.name)) return false;
  if (dispatch) {
    dispatch(
      state.tr.setSelection(
        NodeSelection.create(state.doc, $from.pos - before.nodeSize),
      ),
    );
  }
  return true;
};

/**
 * Arrow-right: if the cursor (empty TextSelection) is immediately
 * before a chip node, select it instead of jumping over it.
 */
const arrowRightIntoAtom: Command = (state, dispatch) => {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || !selection.empty) return false;
  const { $from } = selection;
  const after = $from.nodeAfter;
  if (!after || !ATOM_TYPES.has(after.type.name)) return false;
  if (dispatch) {
    dispatch(
      state.tr.setSelection(NodeSelection.create(state.doc, $from.pos)),
    );
  }
  return true;
};

/**
 * Arrow-down: if a chip with a popover is selected, move focus
 * into the chip editor popover.
 */
const arrowDownIntoPopover: Command = (state) => {
  if (!(state.selection instanceof NodeSelection)) return false;
  const node = state.selection.node;
  if (!ATOM_TYPES.has(node.type.name) || node.type.name === "sort")
    return false;
  const popover = document.querySelector(".chip-editor") as HTMLElement;
  if (!popover) return false;
  popover.focus();
  return true;
};

/**
 * Tab: if a chip with a popover is selected, move focus
 * into the chip editor popover (same as ArrowDown).
 */
const tabIntoPopover: Command = (state) => {
  if (!(state.selection instanceof NodeSelection)) return false;
  const node = state.selection.node;
  if (!ATOM_TYPES.has(node.type.name) || node.type.name === "sort")
    return false;
  const popover = document.querySelector(".chip-editor") as HTMLElement;
  if (!popover) return false;
  popover.focus();
  return true;
};

export function atomNavigationKeymap() {
  return keymap({
    ArrowLeft: arrowLeftIntoAtom,
    ArrowRight: arrowRightIntoAtom,
    ArrowDown: arrowDownIntoPopover,
    Tab: tabIntoPopover,
  });
}
