/**
 * ProseMirror NodeView bridge for Svelte components.
 *
 * Each atom node type (field-value, range, sort) gets a Svelte component
 * mounted as its NodeView. The NodeView reads attributes from the PM node
 * and passes them as props to the Svelte component.
 *
 * NodeViews are responsible only for rendering — the node's attributes
 * are the source of truth.
 */
import type { NodeView, EditorView } from "prosemirror-view";
import type { Node as ProseMirrorNode } from "prosemirror-model";

import FieldValueChip from "./FieldValueChip.svelte";
import RangeChip from "./RangeChip.svelte";
import SortChip from "./SortChip.svelte";

/** Generic Svelte NodeView that mounts a component with node attrs as props */
class SvelteNodeView implements NodeView {
  dom: HTMLElement;
  private component: any;

  constructor(
    ComponentClass: any,
    node: ProseMirrorNode,
    _view: EditorView,
    _getPos: (() => number | undefined) | boolean,
  ) {
    this.dom = document.createElement("span");
    this.dom.classList.add("search-nodeview");
    this.dom.contentEditable = "false";

    this.component = new ComponentClass({
      target: this.dom,
      props: this.extractProps(node),
    });
  }

  /** Update the component when the node's attributes change */
  update(node: ProseMirrorNode): boolean {
    this.component.$set(this.extractProps(node));
    return true;
  }

  /** Clean up the Svelte component on destroy */
  destroy() {
    this.component.$destroy();
  }

  /** Prevent ProseMirror from treating the content as editable */
  stopEvent(): boolean {
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
  return new SvelteNodeView(FieldValueChip, node, view, getPos);
}

/** NodeView constructor for range nodes */
export function rangeNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(RangeChip, node, view, getPos);
}

/** NodeView constructor for sort nodes */
export function sortNodeView(
  node: ProseMirrorNode,
  view: EditorView,
  getPos: (() => number | undefined) | boolean,
): NodeView {
  return new SvelteNodeView(SortChip, node, view, getPos);
}

/** All NodeView constructors, ready to pass to EditorView */
export const nodeViews = {
  "field-value": fieldValueNodeView,
  range: rangeNodeView,
  sort: sortNodeView,
};
