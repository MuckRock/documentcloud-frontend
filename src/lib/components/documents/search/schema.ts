import { Schema } from "prosemirror-model";

/**
 * ProseMirror schema for the search editor.
 *
 * Defines four content types within a single paragraph block:
 * - text: regular text for unqualified terms, phrases, operators, etc.
 * - field-value: inline atom for field:value filter pairs (rendered as chips)
 * - range: inline atom for range queries like created_at:[NOW-1MONTH TO *]
 * - sort: inline atom for sort directives like sort:created_at
 */
export const searchSchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    },
    text: {
      group: "inline",
    },
    "field-value": {
      group: "inline",
      inline: true,
      atom: true,
      attrs: {
        field: { default: "" },
        value: { default: "" },
        displayValue: { default: null },
        prefix: { default: null },
        boost: { default: null },
        quoted: { default: false },
      },
      toDOM(node) {
        const { field, value, displayValue, prefix, boost, quoted } =
          node.attrs;
        let text = "";
        if (prefix) text += prefix;
        text += `${field}:`;
        if (quoted) {
          text += `"${value}"`;
        } else {
          text += value;
        }
        if (boost) text += `^${boost}`;

        return [
          "span",
          {
            class: "search-chip search-field-value",
            "data-field": field,
            "data-value": value,
          },
          displayValue ? `${field}: ${displayValue}` : text,
        ];
      },
      parseDOM: [
        {
          tag: "span.search-field-value",
          getAttrs(dom) {
            if (!(dom instanceof HTMLElement)) return false;
            return {
              field: dom.getAttribute("data-field") || "",
              value: dom.getAttribute("data-value") || "",
            };
          },
        },
      ],
    },
    range: {
      group: "inline",
      inline: true,
      atom: true,
      attrs: {
        field: { default: "" },
        lower: { default: "*" },
        upper: { default: "*" },
        inclusiveLower: { default: true },
        inclusiveUpper: { default: true },
        prefix: { default: null },
      },
      toDOM(node) {
        const { field, lower, upper, inclusiveLower, inclusiveUpper, prefix } =
          node.attrs;
        const lb = inclusiveLower ? "[" : "{";
        const rb = inclusiveUpper ? "]" : "}";
        let text = "";
        if (prefix) text += prefix;
        text += `${field}:${lb}${lower} TO ${upper}${rb}`;

        return [
          "span",
          {
            class: "search-chip search-range",
            "data-field": field,
          },
          text,
        ];
      },
      parseDOM: [
        {
          tag: "span.search-range",
          getAttrs(dom) {
            if (!(dom instanceof HTMLElement)) return false;
            return {
              field: dom.getAttribute("data-field") || "",
            };
          },
        },
      ],
    },
    sort: {
      group: "inline",
      inline: true,
      atom: true,
      attrs: {
        field: { default: "" },
        direction: { default: "asc" },
      },
      toDOM(node) {
        const { field, direction } = node.attrs;
        const arrow = direction === "desc" ? "\u2193" : "\u2191";
        return [
          "span",
          {
            class: "search-chip search-sort",
            "data-field": field,
            "data-direction": direction,
          },
          `Sort: ${field} ${arrow}`,
        ];
      },
      parseDOM: [
        {
          tag: "span.search-sort",
          getAttrs(dom) {
            if (!(dom instanceof HTMLElement)) return false;
            return {
              field: dom.getAttribute("data-field") || "",
              direction: dom.getAttribute("data-direction") || "asc",
            };
          },
        },
      ],
    },
  },
  marks: {},
});
