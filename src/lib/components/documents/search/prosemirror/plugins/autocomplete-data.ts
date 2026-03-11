/**
 * Autocomplete field definitions and suggestion logic.
 *
 * Pure functions — no ProseMirror or DOM dependencies.
 * Used by the autocomplete PM plugin for field and value suggestions.
 */

import { listUsers, listOrgs } from "$lib/api/accounts";
import { list as listProjects } from "$lib/api/projects";
import { search as searchDocuments } from "$lib/api/documents";

/** How a field selection is inserted into the editor. */
export type InsertBehavior = "field-value-chip" | "sort-chip" | "range-chip" | "text";

export interface FieldDef {
  name: string;
  label: string;
  description: string;
  insertBehavior: InsertBehavior;
  /** Whether this field has value suggestions in the dropdown (static or API). */
  hasValueSuggestions: boolean;
}

export interface Suggestion {
  label: string;
  value: string;
  description?: string;
}

// ── Field catalog ──────────────────────────────────────────────

const FIELDS: FieldDef[] = [
  // Chippable with static values
  {
    name: "access",
    label: "Access",
    description: "Access level",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "status",
    label: "Status",
    description: "Processing status",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "language",
    label: "Language",
    description: "Document language",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  // Chippable — API-backed values
  {
    name: "user",
    label: "User",
    description: "Filter by user",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "organization",
    label: "Organization",
    description: "Filter by organization",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "project",
    label: "Project",
    description: "Filter by project",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "document",
    label: "Document",
    description: "Filter by document ID",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: true,
  },
  {
    name: "tag",
    label: "Tag",
    description: "Filter by tag",
    insertBehavior: "field-value-chip",
    hasValueSuggestions: false,
  },
  // Sort
  {
    name: "sort",
    label: "Sort",
    description: "Sort results",
    insertBehavior: "sort-chip",
    hasValueSuggestions: true,
  },
  // Plain-text fields (insert "field:" as text)
  {
    name: "title",
    label: "Title",
    description: "Search document titles",
    insertBehavior: "text",
    hasValueSuggestions: false,
  },
  {
    name: "source",
    label: "Source",
    description: "Search document sources",
    insertBehavior: "text",
    hasValueSuggestions: false,
  },
  {
    name: "description",
    label: "Description",
    description: "Search descriptions",
    insertBehavior: "text",
    hasValueSuggestions: false,
  },
  {
    name: "text",
    label: "Full Text",
    description: "Search document text",
    insertBehavior: "text",
    hasValueSuggestions: false,
  },
  {
    name: "created_at",
    label: "Created At",
    description: "Filter by creation date",
    insertBehavior: "range-chip",
    hasValueSuggestions: false,
  },
  {
    name: "updated_at",
    label: "Updated At",
    description: "Filter by update date",
    insertBehavior: "range-chip",
    hasValueSuggestions: false,
  },
  {
    name: "page_count",
    label: "Page Count",
    description: "Filter by page count",
    insertBehavior: "range-chip",
    hasValueSuggestions: false,
  },
  {
    name: "slug",
    label: "Slug",
    description: "Filter by document slug",
    insertBehavior: "text",
    hasValueSuggestions: false,
  },
];

/** Alias field names that map to canonical names. */
const FIELD_ALIASES: Record<string, string> = {
  account: "user",
  group: "organization",
  projects: "project",
  id: "document",
  pages: "page_count",
  doctext: "text",
  order: "sort",
};

/** Static value suggestions for enum-like fields. */
const STATIC_VALUES: Record<string, Suggestion[]> = {
  access: [
    { label: "Public", value: "public", description: "Visible to everyone" },
    {
      label: "Organization",
      value: "organization",
      description: "Visible to org members",
    },
    {
      label: "Private",
      value: "private",
      description: "Visible only to you",
    },
  ],
  status: [
    { label: "Success", value: "success", description: "Processing complete" },
    { label: "Readable", value: "readable", description: "Text extracted" },
    { label: "Pending", value: "pending", description: "Still processing" },
    { label: "Error", value: "error", description: "Processing failed" },
    { label: "No File", value: "nofile", description: "No file uploaded" },
  ],
  language: [
    { label: "English", value: "eng" },
    { label: "Spanish", value: "spa" },
    { label: "French", value: "fra" },
    { label: "German", value: "deu" },
    { label: "Italian", value: "ita" },
    { label: "Portuguese", value: "por" },
    { label: "Russian", value: "rus" },
    { label: "Chinese", value: "zho" },
    { label: "Japanese", value: "jpn" },
    { label: "Arabic", value: "ara" },
  ],
  sort: [
    {
      label: "Created (newest)",
      value: "created_at",
      description: "Most recent first",
    },
    {
      label: "Created (oldest)",
      value: "-created_at",
      description: "Oldest first",
    },
    { label: "Title (A–Z)", value: "title" },
    { label: "Title (Z–A)", value: "-title" },
    { label: "Pages (most)", value: "page_count" },
    { label: "Pages (fewest)", value: "-page_count" },
    { label: "Source (A–Z)", value: "source" },
    { label: "Source (Z–A)", value: "-source" },
    {
      label: "Relevance",
      value: "score",
      description: "Default sort by score",
    },
  ],
};

// ── Range field configuration ─────────────────────────────────

export interface RangeFieldConfig {
  startLabel: string;
  endLabel: string;
  shortcuts: Array<{
    label: string;
    lower: string;
    upper: string;
    inclusiveLower?: boolean; // default true
    inclusiveUpper?: boolean; // default true
  }>;
}

const DATE_RANGE_CONFIG: RangeFieldConfig = {
  startLabel: "Start Date",
  endLabel: "End Date",
  shortcuts: [
    { label: "Last week", lower: "NOW-7DAYS", upper: "*" },
    { label: "Last month", lower: "NOW-1MONTH", upper: "*" },
    { label: "Last 3 months", lower: "NOW-3MONTHS", upper: "*" },
    { label: "Last year", lower: "NOW-1YEAR", upper: "*" },
    { label: "Today", lower: "NOW/DAY", upper: "*" },
  ],
};

const RANGE_CONFIGS: Record<string, RangeFieldConfig> = {
  created_at: DATE_RANGE_CONFIG,
  updated_at: DATE_RANGE_CONFIG,
  page_count: {
    startLabel: "Min. Pages",
    endLabel: "Max. Pages",
    shortcuts: [],
  },
};

/** Get range configuration for a field, or undefined if it's not a range field. */
export function getRangeConfig(fieldName: string): RangeFieldConfig | undefined {
  const canonical = resolveFieldName(fieldName);
  return RANGE_CONFIGS[canonical];
}

// ── Public API ─────────────────────────────────────────────────

/** Resolve an alias to the canonical field name. */
export function resolveFieldName(name: string): string {
  return FIELD_ALIASES[name] ?? name;
}

/** Look up a field definition by name (handles aliases).
 *  Returns a synthetic FieldDef for data_* fields. */
export function resolveField(name: string): FieldDef | undefined {
  const canonical = resolveFieldName(name);
  const found = FIELDS.find((f) => f.name === canonical);
  if (found) return found;

  // Synthetic def for data_* fields
  if (canonical.startsWith("data_")) {
    return {
      name: canonical,
      label: canonical.replace(/^data_/, ""),
      description: `Data field: ${canonical.replace(/^data_/, "")}`,
      insertBehavior: "field-value-chip",
      hasValueSuggestions: false, // suggestions come from preloaded data
    };
  }

  return undefined;
}

/** Get all field suggestions (unfiltered). Used when opening via shortcut.
 *  When `extraFields` is provided, also includes data_* keys. */
export function getAllFieldSuggestions(
  extraFields?: Set<string>,
): Suggestion[] {
  const results = FIELDS.map((f) => ({
    label: f.label,
    value: f.name,
    description: f.description,
  }));

  if (extraFields) {
    for (const fieldName of extraFields) {
      if (!fieldName.startsWith("data_")) continue;
      const displayName = fieldName.replace(/^data_/, "");
      results.push({
        label: displayName,
        value: fieldName,
        description: "Data field",
      });
    }
  }

  return results;
}

/** Get field suggestions matching a partial input.
 *  When `extraFields` is provided, also matches data_* keys from preloaded data. */
export function getFieldSuggestions(
  filter: string,
  extraFields?: Set<string>,
): Suggestion[] {
  if (!filter) return [];

  const lower = filter.toLowerCase();
  const results: Suggestion[] = [];

  for (const field of FIELDS) {
    if (
      field.name.startsWith(lower) ||
      field.label.toLowerCase().startsWith(lower)
    ) {
      results.push({
        label: field.label,
        value: field.name,
        description: field.description,
      });
    }
  }

  // Also match aliases
  for (const [alias, canonical] of Object.entries(FIELD_ALIASES)) {
    if (alias.startsWith(lower)) {
      const field = FIELDS.find((f) => f.name === canonical);
      if (field && !results.some((r) => r.value === canonical)) {
        results.push({
          label: `${field.label} (${alias})`,
          value: field.name,
          description: field.description,
        });
      }
    }
  }

  // Match data_* keys from preloaded data by their display name
  if (extraFields) {
    for (const fieldName of extraFields) {
      if (!fieldName.startsWith("data_")) continue;
      if (results.some((r) => r.value === fieldName)) continue;
      const displayName = fieldName.replace(/^data_/, "");
      if (
        displayName.toLowerCase().startsWith(lower) ||
        fieldName.toLowerCase().startsWith(lower)
      ) {
        results.push({
          label: displayName,
          value: fieldName,
          description: `Data field`,
        });
      }
    }
  }

  return results;
}

/** Get value suggestions for a specific field, filtered by partial input. */
export function getValueSuggestions(
  fieldName: string,
  filter: string,
): Suggestion[] {
  const canonical = resolveFieldName(fieldName);
  const values = STATIC_VALUES[canonical];
  if (!values) return [];

  if (!filter) return values;
  const lower = filter.toLowerCase();
  return values.filter(
    (v) =>
      v.value.toLowerCase().startsWith(lower) ||
      v.label.toLowerCase().startsWith(lower),
  );
}

/**
 * Analyze text before the cursor to determine the autocomplete trigger state.
 *
 * Returns the stage ('field', 'value', or null) and relevant metadata.
 */
/**
 * Analyze text before the cursor to determine the autocomplete trigger state.
 *
 * @param preloadedFields - Set of field names that have preloaded suggestions
 *   from search results. Fields in this set trigger value-stage autocomplete
 *   even if they don't have static or API-backed suggestions (e.g. tag, data_*).
 */
export function detectTrigger(
  textBeforeCursor: string,
  preloadedFields?: Set<string>,
): {
  stage: "field" | "value" | null;
  /** For field stage: the partial text the user has typed */
  fieldFilter?: string;
  /** For value stage: the canonical field name */
  fieldName?: string;
  /** For value stage: the partial value text after the colon */
  valueFilter?: string;
  /** Character offset in textBeforeCursor where the trigger expression starts */
  triggerStart?: number;
} {
  if (!textBeforeCursor) return { stage: null };

  // Normalize non-breaking spaces (\u00A0) to regular spaces — browsers
  // insert &nbsp; in contenteditable to prevent whitespace collapsing.
  const text = textBeforeCursor.replace(/\u00A0/g, " ");

  // Check for quoted value pattern: field:"value text
  // This allows spaces inside the value while maintaining autocomplete.
  const quotedMatch = text.match(
    /([+-]?[a-zA-Z_][a-zA-Z0-9_]*):\"([^"]*)$/,
  );
  if (quotedMatch) {
    const rawField = quotedMatch[1]!.replace(/^[+-]/, "");
    const canonical = resolveFieldName(rawField);
    const valueFilter = quotedMatch[2]!;
    const triggerStart = quotedMatch.index!;
    const field = FIELDS.find((f) => f.name === canonical);

    if (field && field.hasValueSuggestions) {
      return { stage: "value", fieldName: canonical, valueFilter, triggerStart };
    }
    if (field && preloadedFields?.has(canonical)) {
      return { stage: "value", fieldName: canonical, valueFilter, triggerStart };
    }
    if (!field && preloadedFields?.has(rawField)) {
      return {
        stage: "value",
        fieldName: rawField,
        valueFilter,
        triggerStart,
      };
    }
    if (field) return { stage: null };
    return { stage: null };
  }

  // Find the current "word" — text from last whitespace (or start) to end
  const lastSpace = text.lastIndexOf(" ");
  const word = text.substring(lastSpace + 1);
  const triggerStart = lastSpace + 1;

  if (!word) return { stage: null };

  // Check if the word contains a colon (field:value pattern)
  const colonIndex = word.indexOf(":");
  if (colonIndex >= 0) {
    const rawField = word.substring(0, colonIndex);
    // Strip leading +/- prefix
    const fieldName = rawField.replace(/^[+-]/, "");
    const valueText = word.substring(colonIndex + 1);
    const canonical = resolveFieldName(fieldName);
    const field = FIELDS.find((f) => f.name === canonical);

    if (field && field.hasValueSuggestions) {
      return {
        stage: "value",
        fieldName: canonical,
        valueFilter: valueText,
        triggerStart,
      };
    }

    // Field exists but no static/API suggestions — check preloaded data
    if (field && preloadedFields?.has(canonical)) {
      return {
        stage: "value",
        fieldName: canonical,
        valueFilter: valueText,
        triggerStart,
      };
    }

    // Unknown field with preloaded data (data_* fields)
    if (!field && preloadedFields?.has(fieldName)) {
      return {
        stage: "value",
        fieldName: fieldName,
        valueFilter: valueText,
        triggerStart,
      };
    }

    // Field exists but no suggestions at all → no autocomplete
    if (field) return { stage: null };

    // Unknown field — could be data_* or typo — no autocomplete
    return { stage: null };
  }

  // No colon — check if it looks like a field name (1+ alphanumeric chars)
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word) && word.length >= 1) {
    return { stage: "field", fieldFilter: word, triggerStart };
  }

  return { stage: null };
}

// ── Async field support ──────────────────────────────────────

const ASYNC_FIELDS = new Set(["user", "organization", "project", "document"]);

/** Returns true for fields whose value suggestions come from an API call. */
export function isAsyncField(fieldName: string): boolean {
  return ASYNC_FIELDS.has(resolveFieldName(fieldName));
}

/**
 * Fetch value suggestions from the API for an async field.
 *
 * When `preloaded` is provided and `filter` is empty, returns the preloaded
 * suggestions for the field (derived from current search results) without
 * making an API call. Falls back to the API when the user types a filter
 * or when no preloaded data exists for the field.
 */
export async function fetchValueSuggestions(
  fieldName: string,
  filter: string,
  preloaded?: Record<string, Suggestion[]>,
): Promise<Suggestion[]> {
  const canonical = resolveFieldName(fieldName);

  // Use preloaded suggestions when available and no API endpoint exists
  // for this field (tag, data_* fields). For API-backed fields, use
  // preloaded only when filter is empty (as a fast default).
  if (preloaded?.[canonical]?.length) {
    if (!ASYNC_FIELDS.has(canonical)) {
      // Preloaded-only field: always use preloaded data, with filtering
      if (!filter) return preloaded[canonical];
      const lower = filter.toLowerCase();
      return preloaded[canonical].filter(
        (s) =>
          s.value.toLowerCase().startsWith(lower) ||
          s.label.toLowerCase().startsWith(lower),
      );
    }
    // API-backed field with empty filter: use preloaded as fast default
    if (!filter) return preloaded[canonical];
  }

  switch (canonical) {
    case "user": {
      const resp = await listUsers({ name__istartswith: filter });
      if (!resp.data) return [];
      return resp.data.results.map((u) => ({
        label: u.name || u.username,
        value: String(u.id),
      }));
    }
    case "organization": {
      const resp = await listOrgs({ name__istartswith: filter });
      if (!resp.data) return [];
      return resp.data.results.map((o) => ({
        label: o.name,
        value: String(o.id),
      }));
    }
    case "project": {
      const params: Record<string, string> = {};
      if (filter) params.query = filter;
      const resp = await listProjects(params);
      if (!resp.data) return [];
      return resp.data.results.map((p) => ({
        label: p.title,
        value: String(p.id),
      }));
    }
    case "document": {
      const query = filter ? `title:${filter}*` : "*";
      const resp = await searchDocuments(query, {
        hl: false,
        per_page: 10,
      });
      if (!resp.data) return [];
      return resp.data.results.map((d) => ({
        label: d.title,
        value: String(d.id),
      }));
    }
    default:
      return [];
  }
}

/**
 * Batch-fetch display names for entity field-value nodes.
 *
 * Groups node data by field type and makes parallel API calls.
 * Returns a map of "field:value" → displayName.
 */
export async function fetchDisplayNames(
  nodes: Array<{ field: string; value: string }>,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (nodes.length === 0) return result;

  // Group by canonical field
  const groups: Record<string, Set<string>> = {};
  for (const n of nodes) {
    const canonical = resolveFieldName(n.field);
    if (!ASYNC_FIELDS.has(canonical)) continue;
    if (!groups[canonical]) groups[canonical] = new Set();
    groups[canonical].add(n.value);
  }

  const promises: Promise<void>[] = [];

  if (groups.user?.size) {
    promises.push(
      listUsers({ id__in: [...groups.user].join(",") }).then((resp) => {
        if (!resp.data) return;
        for (const u of resp.data.results) {
          result.set(`user:${u.id}`, u.name || u.username);
        }
      }),
    );
  }

  if (groups.organization?.size) {
    promises.push(
      listOrgs({ id__in: [...groups.organization].join(",") }).then((resp) => {
        if (!resp.data) return;
        for (const o of resp.data.results) {
          result.set(`organization:${o.id}`, o.name);
        }
      }),
    );
  }

  if (groups.project?.size) {
    promises.push(
      listProjects({ id__in: [...groups.project].join(",") }).then((resp) => {
        if (!resp.data) return;
        for (const p of resp.data.results) {
          result.set(`project:${p.id}`, p.title);
        }
      }),
    );
  }

  // Document display names: use search API with id filter
  if (groups.document?.size) {
    const ids = [...groups.document];
    const query = ids.map((id) => `document:${id}`).join(" OR ");
    promises.push(
      searchDocuments(query, { hl: false, per_page: ids.length }).then(
        (resp) => {
          if (!resp.data) return;
          for (const d of resp.data.results) {
            result.set(`document:${d.id}`, d.title);
          }
        },
      ),
    );
  }

  await Promise.all(promises);
  return result;
}
