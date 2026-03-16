/** Format a value for display. ISO dates become locale strings. */
export function displayBound(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }
  return value;
}

/** Format a bound for use in an aria label. Wildcards become "any". */
function labelBound(value: string): string {
  return value === "*" ? "any" : displayBound(value);
}

function prefixText(prefix: string | null | undefined): string {
  if (prefix === "+") return "required, ";
  if (prefix === "-") return "excluded, ";
  return "";
}

export function fieldValueLabel(attrs: Record<string, any>): string {
  const label = attrs.displayValue ?? displayBound(attrs.value ?? "");
  const boostText =
    attrs.boost && attrs.boost > 1 ? `, boost ${attrs.boost}` : "";
  return `${prefixText(attrs.prefix)}${attrs.field}: ${label}${boostText}`;
}

export function rangeLabel(attrs: Record<string, any>): string {
  const lower = attrs.lower ?? "*";
  const upper = attrs.upper ?? "*";
  const lowerDesc = attrs.inclusiveLower !== false ? "from" : "after";
  const upperDesc = attrs.inclusiveUpper !== false ? "to" : "before";
  return `${prefixText(attrs.prefix)}${attrs.field}: ${lowerDesc} ${labelBound(lower)} ${upperDesc} ${labelBound(upper)}`;
}

export function sortLabel(attrs: Record<string, any>): string {
  const dir = attrs.direction === "desc" ? "descending" : "ascending";
  return `Sort by ${attrs.field}, ${dir}`;
}

/**
 * Compute an atom label from a node type name and its attributes.
 * Convenient for ProseMirror NodeView code that has both values at hand.
 */
export function atomLabel(type: string, attrs: Record<string, any>): string {
  switch (type) {
    case "field-value":
      return fieldValueLabel(attrs);
    case "range":
      return rangeLabel(attrs);
    case "sort":
      return sortLabel(attrs);
    default:
      return "";
  }
}
