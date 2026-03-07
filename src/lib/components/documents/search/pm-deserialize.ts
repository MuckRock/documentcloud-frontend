import type { Node as ProseMirrorNode } from "prosemirror-model";
import lucene from "lucene";
import type {
  AST,
  BinaryAST,
  LeftOnlyAST,
  Node,
  NodeTerm,
  NodeRangedTerm,
} from "lucene";
import { searchSchema } from "./schema";

/**
 * Fields that should be rendered as field-value chips.
 * All other field:value pairs remain as plain text.
 */
const CHIPPABLE_FIELDS = new Set([
  "user",
  "account",
  "organization",
  "group",
  "project",
  "projects",
  "document",
  "id",
  "access",
  "status",
  "language",
  "tag",
]);

const IMPLICIT = "<implicit>";

/**
 * Deserialize a Lucene query string into a ProseMirror document.
 *
 * Uses the `lucene` npm package to parse the string into an AST, then converts
 * recognized patterns into the appropriate PM node types. Anything not recognized
 * as a structured node stays as text.
 *
 * Falls back to plain text if the parser throws.
 */
export function deserialize(query: string): ProseMirrorNode {
  if (!query || !query.trim()) {
    return searchSchema.node("doc", null, [
      searchSchema.node("paragraph", null, []),
    ]);
  }

  try {
    const ast = lucene.parse(query);
    const nodes = astToNodes(ast, query);
    const content = nodes.length > 0 ? nodes : [];
    return searchSchema.node("doc", null, [
      searchSchema.node("paragraph", null, content),
    ]);
  } catch {
    // Parse failed — fall back to the whole string as plain text
    return searchSchema.node("doc", null, [
      searchSchema.node("paragraph", null, [searchSchema.text(query)]),
    ]);
  }
}

/**
 * Walk the lucene AST and produce an array of PM inline nodes.
 *
 * Strategy: we reconstruct the original text from the AST, converting
 * recognized structured patterns (chippable fields, ranges, sorts) into
 * PM atom nodes, and keeping everything else as text.
 *
 * Because the lucene AST doesn't perfectly preserve whitespace and operator
 * positioning, we use the original query string with position information
 * from the AST to extract text spans accurately.
 */
function astToNodes(
  ast: AST,
  originalQuery: string,
): ProseMirrorNode[] {
  const result: ProseMirrorNode[] = [];
  // Use a position-based approach: collect "segments" with their positions,
  // then fill gaps with text from the original query.
  const segments: Array<{
    start: number;
    end: number;
    node: ProseMirrorNode | null; // null means "use original text"
  }> = [];

  collectSegments(ast, originalQuery, segments);

  // Sort segments by start position
  segments.sort((a, b) => a.start - b.start);

  // Merge segments and fill gaps with text
  let pos = 0;
  for (const seg of segments) {
    // Fill gap before this segment with text
    if (seg.start > pos) {
      const gapText = originalQuery.substring(pos, seg.start);
      if (gapText) {
        result.push(searchSchema.text(gapText));
      }
    }
    if (seg.node) {
      result.push(seg.node);
    } else {
      const text = originalQuery.substring(seg.start, seg.end);
      if (text) {
        result.push(searchSchema.text(text));
      }
    }
    pos = Math.max(pos, seg.end);
  }

  // Trailing text after last segment
  if (pos < originalQuery.length) {
    const trailing = originalQuery.substring(pos);
    if (trailing) {
      result.push(searchSchema.text(trailing));
    }
  }

  // If no segments were collected, return the whole query as text
  if (result.length === 0 && originalQuery.trim()) {
    result.push(searchSchema.text(originalQuery));
  }

  return result;
}

/**
 * Recursively collect segments from the AST tree.
 */
function collectSegments(
  astOrNode: AST | Node,
  query: string,
  segments: Array<{ start: number; end: number; node: ProseMirrorNode | null }>,
): void {
  if (isNodeRangedTerm(astOrNode)) {
    handleRangedTerm(astOrNode, query, segments);
    return;
  }

  if (isNodeTerm(astOrNode)) {
    handleTerm(astOrNode, query, segments);
    return;
  }

  // It's an AST node (has left, possibly right)
  const ast = astOrNode as AST;

  if (ast.left) {
    collectSegments(ast.left, query, segments);
  }

  if (isBinaryAST(ast) && ast.right) {
    collectSegments(ast.right, query, segments);
  }
}

/**
 * Handle a single term node from the AST.
 */
function handleTerm(
  node: NodeTerm,
  query: string,
  segments: Array<{ start: number; end: number; node: ProseMirrorNode | null }>,
): void {
  let field = node.field;
  let prefix: string | null = null;

  // The parser puts +/- prefix into the field name for field:value syntax
  if (field && field !== IMPLICIT) {
    if (field.startsWith("+") || field.startsWith("-")) {
      prefix = field.charAt(0);
      field = field.substring(1);
    }
  }

  // Handle sort:field
  if (field === "sort") {
    const direction =
      node.prefix === "-" ? "desc" : "asc";
    const sortField = node.term;

    const pmNode = searchSchema.nodes.sort.create({
      field: sortField,
      direction,
    });

    const { start, end } = getTermFullSpan(node, query, prefix);
    segments.push({ start, end, node: pmNode });
    return;
  }

  // Handle chippable field:value
  if (field !== IMPLICIT && CHIPPABLE_FIELDS.has(field)) {
    const attrs: Record<string, unknown> = {
      field,
      value: node.term,
      prefix,
      boost: node.boost ?? null,
      quoted: node.quoted ?? false,
      displayValue: null,
    };

    const pmNode = searchSchema.nodes["field-value"].create(attrs);
    const { start, end } = getTermFullSpan(node, query, prefix);
    segments.push({ start, end, node: pmNode });
    return;
  }

  // Everything else: implicit terms, non-chippable fields, etc.
  // These stay as text — we don't create a segment, letting the gap-fill handle it.
  // But if it's a field:value that's not chippable, we still need to mark its span
  // so it doesn't get double-counted.
  if (field !== IMPLICIT) {
    const { start, end } = getTermFullSpan(node, query, prefix);
    segments.push({ start, end, node: null });
  }
  // For implicit terms, the gap-filling mechanism handles them automatically.
}

/**
 * Handle a ranged term node from the AST.
 */
function handleRangedTerm(
  node: NodeRangedTerm,
  query: string,
  segments: Array<{ start: number; end: number; node: ProseMirrorNode | null }>,
): void {
  let field = node.field;
  let prefix: string | null = null;

  if (field && field !== IMPLICIT) {
    if (field.startsWith("+") || field.startsWith("-")) {
      prefix = field.charAt(0);
      field = field.substring(1);
    }
  }

  // Map inclusive string to booleans
  const { inclusiveLower, inclusiveUpper } = mapInclusive(node.inclusive);

  const pmNode = searchSchema.nodes.range.create({
    field,
    lower: node.term_min,
    upper: node.term_max,
    inclusiveLower,
    inclusiveUpper,
    prefix,
  });

  // Find the span in the original query
  const { start, end } = getRangeFullSpan(node, query, prefix);
  segments.push({ start, end, node: pmNode });
}

/**
 * Map the lucene parser's inclusive string to boolean lower/upper values.
 */
function mapInclusive(inclusive: string): {
  inclusiveLower: boolean;
  inclusiveUpper: boolean;
} {
  switch (inclusive) {
    case "both":
      return { inclusiveLower: true, inclusiveUpper: true };
    case "none":
      return { inclusiveLower: false, inclusiveUpper: false };
    case "left":
      return { inclusiveLower: true, inclusiveUpper: false };
    case "right":
      return { inclusiveLower: false, inclusiveUpper: true };
    default:
      return { inclusiveLower: true, inclusiveUpper: true };
  }
}

/**
 * Get the full span (start, end) of a term node in the original query.
 *
 * We compute end positions from the content length rather than using the
 * parser's termLocation.end.offset, which includes trailing whitespace
 * (it points to the start of the next token, not the end of the current one).
 */
function getTermFullSpan(
  node: NodeTerm,
  query: string,
  prefix: string | null,
): { start: number; end: number } {
  let start: number;

  if (node.fieldLocation && node.field !== IMPLICIT) {
    start = node.fieldLocation.start.offset;
  } else if (node.termLocation) {
    start = node.termLocation.start.offset;
    // Adjust for prefix on bare terms (field === IMPLICIT with prefix)
    if (node.field === IMPLICIT && node.prefix && start > 0) {
      const charBefore = query.charAt(start - 1);
      if (charBefore === node.prefix) {
        start = start - 1;
      }
    }
  } else {
    return { start: 0, end: 0 };
  }

  // Compute end from content length:
  // For field:value → field (with prefix) + ":" + (quote?) + term + (quote?) + boost
  // For implicit terms → (prefix?) + term + boost/similarity
  let length = 0;
  if (node.field !== IMPLICIT) {
    // field includes prefix char if present (e.g. "+user")
    length += node.field.length + 1; // field + ":"
    if (node.prefix) length += 1; // term prefix (e.g. "-" in sort:-field)
    if (node.quoted) length += 1; // opening quote
    length += node.term.length;
    if (node.quoted) length += 1; // closing quote
  } else {
    if (node.prefix) length += 1; // +/-
    if (node.quoted) length += 1;
    length += node.term.length;
    if (node.quoted) length += 1;
  }

  if (node.boost) {
    length += `^${node.boost}`.length;
  }

  if (node.similarity !== null && node.similarity !== undefined) {
    length += `~${node.similarity}`.length;
  }

  if (node.proximity !== null && node.proximity !== undefined) {
    length += `~${node.proximity}`.length;
  }

  return { start, end: start + length };
}

/**
 * Get the full span of a range term node in the original query.
 */
function getRangeFullSpan(
  node: NodeRangedTerm,
  query: string,
  prefix: string | null,
): { start: number; end: number } {
  let start: number;

  if (node.fieldLocation) {
    start = node.fieldLocation.start.offset;
  } else {
    return { start: 0, end: 0 };
  }

  // Find the closing bracket/brace after the field location
  const fieldStr = query.substring(start);
  const closeBracket = fieldStr.indexOf("]");
  const closeBrace = fieldStr.indexOf("}");

  let end: number;
  if (closeBracket >= 0 && closeBrace >= 0) {
    end = start + Math.min(closeBracket, closeBrace) + 1;
  } else if (closeBracket >= 0) {
    end = start + closeBracket + 1;
  } else if (closeBrace >= 0) {
    end = start + closeBrace + 1;
  } else {
    // Fallback
    end = query.length;
  }

  return { start, end };
}

// Type guard helpers
function isNodeTerm(n: unknown): n is NodeTerm {
  return typeof n === "object" && n !== null && "term" in n;
}

function isNodeRangedTerm(n: unknown): n is NodeRangedTerm {
  return typeof n === "object" && n !== null && "term_max" in n;
}

function isBinaryAST(ast: unknown): ast is BinaryAST {
  return typeof ast === "object" && ast !== null && "right" in ast;
}
