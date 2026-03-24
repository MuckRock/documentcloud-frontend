import { Schema } from "prosemirror-model";

/** The set of atom node type names defined in the schema. */
export const ATOM_TYPES = new Set(["field-value", "range", "sort"]);

/**
 * ProseMirror schema for the search editor.
 *
 * Defines four content types within a single paragraph block:
 * - text: regular text for unqualified terms, phrases, operators, etc.
 * - field-value: inline atom for field:value filter pairs (rendered as atoms)
 * - range: inline atom for range queries like created_at:[NOW-1MONTH TO *]
 * - sort: inline atom for sort directives like sort:created_at
 *
 * Rendering for atom nodes (field-value, range, sort) is handled entirely by
 * Svelte NodeViews — see nodeviews.ts. The toDOM methods here are minimal
 * placeholders required by ProseMirror's schema definition; they are not used
 * for display. Clipboard copy/paste bypasses HTML serialization entirely by
 * writing serialized Lucene text directly to the clipboard.
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
      toDOM() {
        return ["span", { class: "search-atom search-field-value" }];
      },
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
      toDOM() {
        return ["span", { class: "search-atom search-range" }];
      },
    },
    sort: {
      group: "inline",
      inline: true,
      atom: true,
      attrs: {
        field: { default: "" },
        direction: { default: "asc" },
      },
      toDOM() {
        return ["span", { class: "search-atom search-sort" }];
      },
    },
  },
  marks: {},
});
