/**
 * ProseMirror NodeView bridge for Svelte components.
 *
 * Each atom node type (field-value, range, sort) gets a Svelte component
 * mounted as its NodeView. The NodeView reads attributes from the PM node
 * and passes them as props to the Svelte component.
 *
 * Field-value and range chips open a ChipEditor popover when selected
 * (via click or arrow-key navigation). Sort chips toggle direction on click.
 */
import type { NodeView, EditorView } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import { NodeSelection } from "prosemirror-state";
import { mount, unmount } from "svelte";

import FieldValueChip from "../FieldValueChip.svelte";
import RangeChip from "../RangeChip.svelte";
import SortChip from "../SortChip.svelte";
import ChipEditor from "../ChipEditor.svelte";

type ChipBehavior = "edit" | "toggle-sort";

/** Generic Svelte NodeView mounts a component with node attrs as props */
class SvelteNodeView implements NodeView {
  dom: HTMLElement;
  private component: Record<string, any>;
  private componentProps: Record<string, any>;
  private chipEditor: Record<string, any> | null = null;
  private chipEditorProps: Record<string, any> = $state({});
  private chipEditorContainer: HTMLElement | null = null;
  private view: EditorView;
  private getPos: () => number | undefined;
  private behavior: ChipBehavior;

  constructor(
    ComponentClass: any,
    node: ProseMirrorNode,
    view: EditorView,
    getPos: boolean | (() => number | undefined),
    behavior: ChipBehavior,
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
    if (this.behavior === "edit") {
      const pos = this.getPos();
      if (pos !== undefined) {
        this.openChipEditor(pos);
      }
    }
  }

  /**
   * Called by ProseMirror when this node loses its NodeSelection
   * (cursor moves away, another node selected, etc.).
   */
  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode");
    if (this.behavior === "edit") {
      this.closeChipEditor();
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
    const currentNode = this.view.state.doc.nodeAt(currentPos);
    if (!currentNode) return;
    const newAttrs = typeof attrs === "function" ? attrs(currentNode.attrs) : attrs;
    const tr = this.view.state.tr.setNodeMarkup(currentPos, undefined, {
      ...currentNode.attrs,
      ...newAttrs,
    });
    // Preserve NodeSelection so deselectNode doesn't fire
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
  private openChipEditor(pos: number) {
    // Already open
    if (this.chipEditor) return;

    const node = this.view.state.doc.nodeAt(pos);
    if (!node) return;

    const showBoost = node.type.name === "field-value";

    this.chipEditorContainer = document.createElement("div");
    document.body.appendChild(this.chipEditorContainer);

    Object.assign(this.chipEditorProps, {
      prefix: node.attrs.prefix ?? null,
      boost: showBoost ? (node.attrs.boost ?? null) : null,
      showBoost,
      anchor: this.dom,
      onPrefixChange: (newPrefix: string | null) => {
        this.updateNodeAttrs({ prefix: newPrefix });
        if (this.chipEditorProps) {
          this.chipEditorProps.prefix = newPrefix;
        }
      },
      onBoostChange: showBoost
        ? (newBoost: number | null) => {
            this.updateNodeAttrs({ boost: newBoost });
            if (this.chipEditorProps) {
              this.chipEditorProps.boost = newBoost;
            }
          }
        : null,
      onDelete: () => {
        const currentPos = this.getPos();
        if (currentPos === undefined) return;
        const currentNode = this.view.state.doc.nodeAt(currentPos);
        if (!currentNode) return;
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
        this.closeChipEditor();
        this.view.focus();
      },
    });

    this.chipEditor = mount(ChipEditor, {
      target: this.chipEditorContainer,
      props: this.chipEditorProps,
    });
  }

  private closeChipEditor() {
    if (this.chipEditor) {
      unmount(this.chipEditor);
      this.chipEditor = null;
    }
    if (this.chipEditorContainer) {
      this.chipEditorContainer.remove();
      this.chipEditorContainer = null;
    }
  }

  /** Update the component when the node's attributes change */
  update(node: ProseMirrorNode): boolean {
    Object.assign(this.componentProps, node.attrs);
    return true;
  }

  /** Clean up the Svelte component on destroy */
  destroy() {
    this.closeChipEditor();
    this.dom.removeEventListener("click", this.toggleSort);
    unmount(this.component);
  }

  /** Atom nodes have no editable content */
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
  return new SvelteNodeView(FieldValueChip, node, view, getPos, "edit");
}

/** NodeView constructor for range nodes */
export function rangeNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(RangeChip, node, view, getPos, "edit");
}

/** NodeView constructor for sort nodes */
export function sortNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(SortChip, node, view, getPos, "toggle-sort");
}

/** All NodeView constructors, ready to pass to EditorView */
export const nodeViews = {
  "field-value": fieldValueNodeView,
  range: rangeNodeView,
  sort: sortNodeView,
};
