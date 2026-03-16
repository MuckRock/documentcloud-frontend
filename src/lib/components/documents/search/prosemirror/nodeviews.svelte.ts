/**
 * ProseMirror NodeView bridge for Svelte components.
 *
 * Each atom node type (field-value, range, sort) gets a Svelte component
 * mounted as its NodeView. The NodeView reads attributes from the PM node
 * and passes them as props to the Svelte component.
 *
 * Field-value and range atoms open an AtomEditor popover when selected
 * (via click or arrow-key navigation). Sort atoms toggle direction on click.
 */
import type { NodeView, EditorView } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { NodeSelection } from "prosemirror-state";
import { mount, unmount } from "svelte";

import FieldValueAtom from "../FieldValueAtom.svelte";
import RangeAtom from "../RangeAtom.svelte";
import SortAtom from "../SortAtom.svelte";
import AtomEditor from "../AtomEditor.svelte";
import { atomLabel } from "../utils/label";

type AtomBehavior = "edit" | "toggle-sort";

/** Generic Svelte NodeView mounts a component with node attrs as props */
// A NodeView lets us take over rendering of a node type — PM delegates DOM creation
// and update to this class instead of using its default rendering.
class SvelteNodeView implements NodeView {
  private static nextId = 0;

  dom: HTMLElement;
  private component: Record<string, any>;
  private componentProps: Record<string, any>;
  private atomEditor: Record<string, any> | null = null;
  private atomEditorProps: Record<string, any> = $state({});
  private atomEditorContainer: HTMLElement | null = null;
  private view: EditorView;
  private getPos: () => number | undefined;
  private behavior: AtomBehavior;

  constructor(
    ComponentClass: any,
    node: ProseMirrorNode,
    view: EditorView,
    getPos: boolean | (() => number | undefined),
    behavior: AtomBehavior,
  ) {
    this.view = view;
    this.getPos = getPos as () => number | undefined;
    this.behavior = behavior;

    this.dom = document.createElement("span");
    this.dom.classList.add("search-nodeview");
    this.dom.contentEditable = "false";
    this.dom.style.display = "inline-block";
    this.dom.style.cursor = "pointer";
    this.dom.style.userSelect = "none";
    this.dom.id = `search-atom-${SvelteNodeView.nextId++}`;
    this.dom.setAttribute("tabindex", "-1");
    this.dom.setAttribute("role", "option");
    this.dom.setAttribute("aria-label", atomLabel(node.type.name, node.attrs));

    this.componentProps = $state({ ...node.attrs });
    this.component = mount(ComponentClass, {
      target: this.dom,
      props: this.componentProps,
    });

    if (this.behavior === "toggle-sort") {
      this.toggleSort = this.toggleSort.bind(this);
      this.dom.addEventListener("click", this.toggleSort);
    }
  }

  /**
   * Called by ProseMirror when this node receives a NodeSelection
   * (via click or arrow-key navigation into the atom node).
   */
  selectNode() {
    this.dom.classList.add("ProseMirror-selectednode");
    this.view.dom.setAttribute("aria-activedescendant", this.dom.id);
    if (this.behavior === "edit") {
      const pos = this.getPos();
      if (pos !== undefined) {
        this.openAtomEditor(pos);
      }
    }
  }

  /**
   * Called by ProseMirror when this node loses its NodeSelection
   * (cursor moves away, another node selected, etc.).
   */
  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode");
    // Only remove if it still points to this atom (autocomplete may have taken over)
    if (this.view.dom.getAttribute("aria-activedescendant") === this.dom.id) {
      this.view.dom.removeAttribute("aria-activedescendant");
    }
    if (this.behavior === "edit") {
      this.closeAtomEditor();
    }
  }

  /**
   * Update the node's attributes and preserve the NodeSelection so
   * the editor's current selection is stable across attribute changes.
   */
  private updateNodeAttrs(
    attrs:
      | Record<string, unknown>
      | ((current: Record<string, unknown>) => Record<string, unknown>),
  ) {
    const currentPos = this.getPos();
    if (currentPos === undefined) return;
    // nodeAt() looks up the node at an exact document position
    const currentNode = this.view.state.doc.nodeAt(currentPos);
    if (!currentNode) return;
    const newAttrs =
      typeof attrs === "function" ? attrs(currentNode.attrs) : attrs;
    const tr = this.view.state.tr.setNodeMarkup(currentPos, undefined, {
      ...currentNode.attrs,
      ...newAttrs,
    });
    // Preserve NodeSelection so deselectNode doesn't fire
    // NodeSelection selects an entire node (vs TextSelection which is a cursor/range in text)
    tr.setSelection(NodeSelection.create(tr.doc, currentPos));
    this.view.dispatch(tr);
  }

  /**
   * When a "sort" node is clicked, we want to toggle the sort direction.
   */
  private toggleSort() {
    this.updateNodeAttrs((attrs) => ({
      direction: attrs.direction === "asc" ? "desc" : "asc",
    }));
  }

  /** When a FieldValue or Range node is selected, we open an editor to tailor its details. */
  private openAtomEditor(pos: number) {
    // Already open
    if (this.atomEditor) return;

    const node = this.view.state.doc.nodeAt(pos);
    if (!node) return;

    const showBoost = node.type.name === "field-value";

    this.atomEditorContainer = document.createElement("div");
    document.body.appendChild(this.atomEditorContainer);

    Object.assign(this.atomEditorProps, {
      prefix: node.attrs.prefix ?? null,
      boost: showBoost ? (node.attrs.boost ?? null) : null,
      showBoost,
      anchor: this.dom,
      onPrefixChange: (newPrefix: string | null) => {
        this.updateNodeAttrs({ prefix: newPrefix });
        if (this.atomEditorProps) {
          this.atomEditorProps.prefix = newPrefix;
        }
      },
      onBoostChange: showBoost
        ? (newBoost: number | null) => {
            this.updateNodeAttrs({ boost: newBoost });
            if (this.atomEditorProps) {
              this.atomEditorProps.boost = newBoost;
            }
          }
        : null,
      onDelete: () => {
        const currentPos = this.getPos();
        if (currentPos === undefined) return;
        const currentNode = this.view.state.doc.nodeAt(currentPos);
        if (!currentNode) return;
        // Delete by position range: from the node's start to start + nodeSize
        const tr = this.view.state.tr.delete(
          currentPos,
          currentPos + currentNode.nodeSize,
        );
        this.view.dispatch(tr);
      },
      onFocusEditor: () => {
        this.view.focus();
      },
      onClose: () => {
        this.closeAtomEditor();
        this.view.focus();
      },
    });

    this.atomEditor = mount(AtomEditor, {
      target: this.atomEditorContainer,
      props: this.atomEditorProps,
    });
  }

  private closeAtomEditor() {
    if (this.atomEditor) {
      unmount(this.atomEditor);
      this.atomEditor = null;
    }
    if (this.atomEditorContainer) {
      this.atomEditorContainer.remove();
      this.atomEditorContainer = null;
    }
  }

  /** Update the component when the node's attributes change */
  // NodeView.update(): PM calls this when the node changes. Return true = we handled the update;
  // returning false would cause PM to destroy and recreate the NodeView.
  update(node: ProseMirrorNode): boolean {
    Object.assign(this.componentProps, node.attrs);
    this.dom.setAttribute("aria-label", atomLabel(node.type.name, node.attrs));
    return true;
  }

  /** Clean up the Svelte component on destroy */
  destroy() {
    this.closeAtomEditor();
    this.dom.removeEventListener("click", this.toggleSort);
    unmount(this.component);
  }

  /** Atom nodes have no editable content */
  // Atom nodes have no editable content, so we tell PM to ignore all DOM mutations
  // inside this NodeView. Without this, contenteditable changes could confuse PM's state.
  ignoreMutation(): boolean {
    return true;
  }
}

/** NodeView constructors for field-value nodes */
export function fieldValueNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(FieldValueAtom, node, view, getPos, "edit");
}

/** NodeView constructor for range nodes */
export function rangeNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(RangeAtom, node, view, getPos, "edit");
}

/** NodeView constructor for sort nodes */
export function sortNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(SortAtom, node, view, getPos, "toggle-sort");
}

/** All NodeView constructors, ready to pass to EditorView */
export const nodeViews = {
  "field-value": fieldValueNodeView,
  range: rangeNodeView,
  sort: sortNodeView,
};
