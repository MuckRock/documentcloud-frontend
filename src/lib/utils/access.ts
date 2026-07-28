/**
 * Access levels for documents and notes.
 *
 * Documents and notes share the same `Access` values, but label them
 * differently: a note with `organization` access is visible to anyone who can
 * edit the document, so we call it "Collaborators" rather than "Organization".
 *
 * Titles and descriptions are i18n *keys*, translated where they're rendered,
 * so labels follow locale changes.
 */
import type { Access, Maybe } from "$lib/api/types";
import type { SvgComponent } from "svelte-octicons";

import { Globe24, Lock24, Organization24, People24 } from "svelte-octicons";

export type AccessKind = "document" | "note";

export interface Level {
  value: Access;
  title: string;
  description: string;
  icon: typeof SvgComponent;
}

export const VALUES: Access[] = ["private", "organization", "public"];

const ICONS: Record<AccessKind, Record<Access, typeof SvgComponent>> = {
  document: {
    private: Lock24,
    organization: Organization24,
    public: Globe24,
  },
  note: {
    private: Lock24,
    organization: People24,
    public: Globe24,
  },
};

/** i18n key prefix for a given access value, e.g. `access.note.organization` */
function keyRoot(value: Access, kind: AccessKind): string {
  return kind === "note" ? `access.note.${value}` : `access.${value}`;
}

export function getLevels(kind: AccessKind = "document"): Level[] {
  return VALUES.map((value) => ({
    value,
    title: `${keyRoot(value, kind)}.title`,
    description: `${keyRoot(value, kind)}.description`,
    icon: ICONS[kind][value],
  }));
}

export function getLevel(
  access: Access,
  kind: AccessKind = "document",
): Maybe<Level> {
  return getLevels(kind).find((level) => level.value === access);
}
