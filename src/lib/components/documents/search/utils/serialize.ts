import type { Node as ProseMirrorNode, Fragment } from "prosemirror-model";

/**
 * A segment in the offset map produced by serializeWithOffsets().
 * Maps a range in the serialized string back to a ProseMirror position.
 * Only text nodes produce segments (atom nodes are rendered by node views
 * and can't receive inline decorations).
 */
export interface TextOffsetSegment {
  /** Start offset in the serialized string (inclusive). */
  strFrom: number;
  /** End offset in the serialized string (exclusive). */
  strTo: number;
  /** ProseMirror position of the text node's start. */
  pmPos: number;
}

export interface SerializeResult {
  text: string;
  /** Offset map: serialized string ranges → ProseMirror positions for text nodes. */
  offsets: TextOffsetSegment[];
}

const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

/**
 * Core serialization logic shared by serialize() and serializeWithOffsets().
 *
 * When trackOffsets is true, records a TextOffsetSegment for each text node
 * so callers can map serialized string positions back to ProseMirror positions.
 */
function serializeInternal(
  docOrFragment: ProseMirrorNode | Fragment,
  trackOffsets: boolean,
): SerializeResult {
  let result = "";
  const offsets: TextOffsetSegment[] = [];

  /** True when the last thing emitted was an atom node. */
  let lastWasAtom = false;

  const processNode = (node: ProseMirrorNode, pmOffset?: number) => {
    if (node.isText) {
      // Normalize non-breaking spaces (\u00A0) that ProseMirror inserts
      // in contenteditable to prevent browser space collapsing
      const text = (node.text ?? "").replace(/\u00A0/g, " ");
      // Ensure a space between a preceding atom and text
      if (lastWasAtom && text.length > 0 && !text.startsWith(" ")) {
        result += " ";
      }
      if (trackOffsets && pmOffset !== undefined) {
        offsets.push({
          strFrom: result.length,
          strTo: result.length + text.length,
          pmPos: pmOffset + 1, // +1 for paragraph open tag
        });
      }
      result += text;
      lastWasAtom = false;
      return;
    }

    const isAtom = ATOM_TYPES.has(node.type.name);

    // Ensure a space between adjacent nodes and atoms
    if (isAtom && result.length > 0 && !result.endsWith(" ")) {
      result += " ";
    }

    switch (node.type.name) {
      case "field-value": {
        const { field, value, prefix, boost, quoted } = node.attrs;
        if (prefix) result += prefix;
        result += `${field}:`;
        if (quoted) {
          result += `"${value}"`;
        } else {
          result += value;
        }
        if (boost && boost > 1) result += `^${boost}`;
        lastWasAtom = true;
        break;
      }
      case "range": {
        const { field, lower, upper, inclusiveLower, inclusiveUpper, prefix } =
          node.attrs;
        if (prefix) result += prefix;
        const lb = inclusiveLower ? "[" : "{";
        const rb = inclusiveUpper ? "]" : "}";
        result += `${field}:${lb}${lower} TO ${upper}${rb}`;
        lastWasAtom = true;
        break;
      }
      case "sort": {
        const { field, direction } = node.attrs;
        result += "sort:";
        if (direction === "desc") result += "-";
        result += field;
        lastWasAtom = true;
        break;
      }
      default:
        // For container nodes (doc, paragraph), recurse into children
        if (trackOffsets) {
          // PM's forEach passes (child, offset, index) — offset is the child's position relative to parent.
          // We need offsets here to build the position map for decoration targeting.
          node.forEach(processNode);
        } else {
          node.forEach((child) => processNode(child));
        }
    }
  };

  // Distinguish Fragment (a flat list of nodes) from Node (has a type and may contain children)
  if ("forEach" in docOrFragment && !("type" in docOrFragment)) {
    // It's a Fragment
    (docOrFragment as Fragment).forEach((child) => processNode(child));
  } else {
    processNode(docOrFragment as ProseMirrorNode);
  }

  return { text: result, offsets };
}

/**
 * Serialize a ProseMirror document (or fragment) into a Lucene query string.
 *
 * Walks the node tree and concatenates:
 * - Text nodes: emitted verbatim
 * - field-value nodes: [prefix]field:["]value["][^boost]
 * - range nodes: [prefix]field:[[ or {]lower TO upper[} or ]]
 * - sort nodes: sort:[-]field
 *
 * Whitespace between nodes is preserved from the document as-is.
 */
export function serialize(docOrFragment: ProseMirrorNode | Fragment): string {
  return serializeInternal(docOrFragment, false).text;
}

/**
 * Serialize a ProseMirror document and return both the query string and
 * an offset map that relates serialized string positions to ProseMirror
 * document positions. Used by the decoration plugin to map error regions
 * in the serialized string back to inline decorations in the editor.
 */
export function serializeWithOffsets(doc: ProseMirrorNode): SerializeResult {
  return serializeInternal(doc, true);
}
