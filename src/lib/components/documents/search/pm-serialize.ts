import type { Node as ProseMirrorNode, Fragment } from "prosemirror-model";

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
  let result = "";

  /** True when the last thing emitted was an atom node (chip). */
  let lastWasAtom = false;

  const processNode = (node: ProseMirrorNode) => {
    if (node.isText) {
      result += node.text ?? "";
      lastWasAtom = false;
      return;
    }

    const isAtom =
      node.type.name === "field-value" ||
      node.type.name === "range" ||
      node.type.name === "sort";

    // Ensure a space between adjacent atom nodes
    if (isAtom && lastWasAtom) {
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
        if (boost) result += `^${boost}`;
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
        node.forEach(processNode);
    }
  };

  if ("forEach" in docOrFragment && !("type" in docOrFragment)) {
    // It's a Fragment
    (docOrFragment as Fragment).forEach(processNode);
  } else {
    processNode(docOrFragment as ProseMirrorNode);
  }

  return result;
}
