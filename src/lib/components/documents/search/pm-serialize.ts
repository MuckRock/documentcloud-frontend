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

  const processNode = (node: ProseMirrorNode) => {
    if (node.isText) {
      result += node.text ?? "";
      return;
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
        break;
      }
      case "range": {
        const { field, lower, upper, inclusiveLower, inclusiveUpper, prefix } =
          node.attrs;
        if (prefix) result += prefix;
        const lb = inclusiveLower ? "[" : "{";
        const rb = inclusiveUpper ? "]" : "}";
        result += `${field}:${lb}${lower} TO ${upper}${rb}`;
        break;
      }
      case "sort": {
        const { field, direction } = node.attrs;
        result += "sort:";
        if (direction === "desc") result += "-";
        result += field;
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
