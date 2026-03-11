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

import FieldValueChip from "./FieldValueChip.svelte";
import RangeChip from "./RangeChip.svelte";
import SortChip from "./SortChip.svelte";
import ChipEditor from "./ChipEditor.svelte";

type ChipBehavior = "edit" | "toggle-sort";

/** Generic Svelte NodeView that mounts a component with node attrs as props */
class SvelteNodeView implements NodeView {
  dom: HTMLElement;
  private component: any;
  private chipEditor: any = null;
  private chipEditorContainer: HTMLElement | null = null;
  private view: EditorView;
  private getPos: () => number | undefined;
  private behavior: ChipBehavior;

  constructor(
    ComponentClass: any,
    node: ProseMirrorNode,
    view: EditorView,
    getPos: (() => number | undefined) | boolean,
    behavior: ChipBehavior,
  ) {
    this.view = view;
    this.getPos = getPos as () => number | undefined;
    this.behavior = behavior;

    this.dom = document.createElement("span");
    this.dom.classList.add("search-nodeview");
    this.dom.contentEditable = "false";
    this.dom.style.cursor = "pointer";
    this.dom.style.userSelect = "none";

    this.component = new ComponentClass({
      target: this.dom,
      props: this.extractProps(node),
    });

    // Sort chips toggle on click; edit chips use selectNode/deselectNode
    if (this.behavior === "toggle-sort") {
      this.dom.addEventListener("click", this.handleClick);
    }
  }

  private handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const pos = this.getPos();
    if (pos === undefined) return;

    this.toggleSort(pos);
  };

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

  private toggleSort(pos: number) {
    const node = this.view.state.doc.nodeAt(pos);
    if (!node) return;
    const newDirection = node.attrs.direction === "asc" ? "desc" : "asc";
    const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      direction: newDirection,
    });
    this.view.dispatch(tr);
  }

  /**
   * Update the node's attributes and preserve the NodeSelection so
   * the popover stays open across attribute changes.
   */
  private updateNodeAttrs(attrs: Record<string, unknown>) {
    const currentPos = this.getPos();
    if (currentPos === undefined) return;
    const currentNode = this.view.state.doc.nodeAt(currentPos);
    if (!currentNode) return;
    const tr = this.view.state.tr.setNodeMarkup(currentPos, undefined, {
      ...currentNode.attrs,
      ...attrs,
    });
    // Preserve NodeSelection so deselectNode doesn't fire
    tr.setSelection(NodeSelection.create(tr.doc, currentPos));
    this.view.dispatch(tr);
  }

  private openChipEditor(pos: number) {
    // Already open
    if (this.chipEditor) return;

    const node = this.view.state.doc.nodeAt(pos);
    if (!node) return;

    const showBoost = node.type.name === "field-value";

    this.chipEditorContainer = document.createElement("div");
    document.body.appendChild(this.chipEditorContainer);

    this.chipEditor = new ChipEditor({
      target: this.chipEditorContainer,
      props: {
        prefix: node.attrs.prefix ?? null,
        boost: showBoost ? (node.attrs.boost ?? null) : null,
        showBoost,
        anchor: this.dom,
        onPrefixChange: (newPrefix: string | null) => {
          this.updateNodeAttrs({ prefix: newPrefix });
          this.chipEditor?.$set({ prefix: newPrefix });
        },
        onBoostChange: showBoost
          ? (newBoost: number | null) => {
              this.updateNodeAttrs({ boost: newBoost });
              this.chipEditor?.$set({ boost: newBoost });
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
      },
    });
  }

  private closeChipEditor() {
    if (this.chipEditor) {
      this.chipEditor.$destroy();
      this.chipEditor = null;
    }
    if (this.chipEditorContainer) {
      this.chipEditorContainer.remove();
      this.chipEditorContainer = null;
    }
  }

  /** Update the component when the node's attributes change */
  update(node: ProseMirrorNode): boolean {
    this.component.$set(this.extractProps(node));
    return true;
  }

  /** Clean up the Svelte component on destroy */
  destroy() {
    this.closeChipEditor();
    this.dom.removeEventListener("click", this.handleClick);
    this.component.$destroy();
  }

  /**
   * Intercept mouse events on sort chips so ProseMirror doesn't consume them.
   * For edit chips, let ProseMirror handle clicks normally (creating a
   * NodeSelection which triggers selectNode/deselectNode).
   */
  stopEvent(event: Event): boolean {
    if (this.behavior === "toggle-sort") {
      return event.type === "mousedown" || event.type === "click";
    }
    return false;
  }

  /** Atom nodes have no editable content */
  ignoreMutation(): boolean {
    return true;
  }

  private extractProps(node: ProseMirrorNode): Record<string, unknown> {
    return { ...node.attrs };
  }
}

/** NodeView constructor for field-value nodes */
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
