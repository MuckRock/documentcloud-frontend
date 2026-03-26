/**
 * Extract autocomplete suggestions from document search results.
 *
 * Uses expanded user/org objects on documents to provide contextually
 * relevant suggestions without an API call.
 */

import type { Document, Org, User } from "$lib/api/types";
import type { Suggestion } from "../prosemirror/plugins/autocomplete-data";

import { isOrg, isUser } from "$lib/api/accounts";

/** Extract preloaded autocomplete suggestions from search result documents. */
export function extractSuggestions(
  docs: Iterable<Document>,
): Record<string, Suggestion[]> {
  const users = new Map<string, Suggestion>();
  const orgs = new Map<string, Suggestion>();
  const documents = new Map<string, Suggestion>();
  // data_* and tag values: keyed by field name, deduped by value
  const dataFields = new Map<string, Map<string, Suggestion>>();

  for (const doc of docs) {
    // User (expanded object when DEFAULT_EXPAND includes "user")
    if (isUser(doc.user)) {
      const u = doc.user as User;
      const key = String(u.id);
      if (!users.has(key)) {
        users.set(key, {
          label: u.name ? `${u.name} (${u.username})` : u.username,
          displayValue: u.name || u.username,
          value: key,
        });
      }
    }

    // Organization (expanded object when DEFAULT_EXPAND includes "organization")
    // Skip individual orgs — they represent a single user, not a real organization
    if (isOrg(doc.organization)) {
      const o = doc.organization as Org;
      if (!o.individual) {
        const key = String(o.id);
        if (!orgs.has(key)) {
          orgs.set(key, { label: o.name, value: key });
        }
      }
    }

    // Document itself
    const dKey = String(doc.id);
    if (!documents.has(dKey)) {
      documents.set(dKey, { label: doc.title, value: dKey });
    }

    // Extract tag and data_* values from doc.data
    if (doc.data) {
      for (const [rawKey, values] of Object.entries(doc.data)) {
        if (!Array.isArray(values)) continue;
        // "_tag" key maps to the "tag" search field;
        // other keys need the "data_" prefix for Lucene syntax
        const fieldName = rawKey === "_tag" ? "tag" : `data_${rawKey}`;
        if (!dataFields.has(fieldName)) {
          dataFields.set(fieldName, new Map());
        }
        const fieldMap = dataFields.get(fieldName)!;
        for (const v of values) {
          if (!fieldMap.has(v)) {
            fieldMap.set(v, { label: v, value: v });
          }
        }
      }
    }
  }

  const result: Record<string, Suggestion[]> = {};
  if (users.size) result.user = [...users.values()];
  if (orgs.size) result.organization = [...orgs.values()];
  if (documents.size) result.document = [...documents.values()];
  for (const [fieldName, valueMap] of dataFields) {
    if (valueMap.size) result[fieldName] = [...valueMap.values()];
  }
  return result;
}
