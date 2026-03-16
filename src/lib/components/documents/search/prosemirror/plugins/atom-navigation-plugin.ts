/**
 * ProseMirror keymap plugin for keyboard navigation around atom nodes.
 *
 * - ArrowLeft/Right: select an adjacent atom instead of jumping over it
 * - ArrowDown: move focus into an atom's popover editor (if open)
 */
import { NodeSelection, TextSelection, type Command } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";

const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

/**
 * Arrow-left: if the cursor (empty TextSelection) is immediately
 * after an atom node, select it instead of jumping over it.
 */
// A PM Command is a function (state, dispatch?, view?) → boolean.
// Return true to indicate the command handled the event.
const arrowLeftIntoAtom: Command = (state, dispatch) => {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || !selection.empty) return false;
  const { $from } = selection;
  // Resolved positions expose adjacent nodes: nodeBefore/nodeAfter look at neighboring content
  const before = $from.nodeBefore;
  if (!before || !ATOM_TYPES.has(before.type.name)) return false;
  if (dispatch) {
    dispatch(
      state.tr.setSelection(
        // PM position arithmetic: each node boundary counts as 1 position, so
        // subtracting nodeSize from the current pos gives us the atom's start
        NodeSelection.create(state.doc, $from.pos - before.nodeSize),
      ),
    );
  }
  return true;
};

/**
 * Arrow-right: if the cursor (empty TextSelection) is immediately
 * before an atom node, select it instead of jumping over it.
 */
const arrowRightIntoAtom: Command = (state, dispatch) => {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || !selection.empty) return false;
  const { $from } = selection;
  const after = $from.nodeAfter;
  if (!after || !ATOM_TYPES.has(after.type.name)) return false;
  if (dispatch) {
    dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $from.pos)));
  }
  return true;
};

/**
 * Arrow-down: if an atom with a popover is selected, move focus
 * into the atom editor popover.
 */
const arrowDownIntoPopover: Command = (state) => {
  if (!(state.selection instanceof NodeSelection)) return false;
  const node = state.selection.node;
  if (!ATOM_TYPES.has(node.type.name) || node.type.name === "sort")
    return false;
  const popover = document.querySelector(".atom-editor") as HTMLElement;
  if (!popover) return false;
  popover.focus();
  return true;
};

/**
 * Tab: if an atom with a popover is selected, move focus
 * into the atom editor popover (same as ArrowDown).
 */
const tabIntoPopover: Command = (state) => {
  if (!(state.selection instanceof NodeSelection)) return false;
  const node = state.selection.node;
  if (!ATOM_TYPES.has(node.type.name) || node.type.name === "sort")
    return false;
  const popover = document.querySelector(".atom-editor") as HTMLElement;
  if (!popover) return false;
  popover.focus();
  return true;
};

export function atomNavigationKeymap() {
  // keymap() creates a plugin that maps key bindings to PM commands
  return keymap({
    ArrowLeft: arrowLeftIntoAtom,
    ArrowRight: arrowRightIntoAtom,
    ArrowDown: arrowDownIntoPopover,
    Tab: tabIntoPopover,
  });
}
