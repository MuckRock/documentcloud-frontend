import type { Modification, Angle } from "$lib/api/types";
import type { Page } from "$lib/utils/page.svelte";
import { normalizeAngle } from "$lib/utils/normalizeAngle";

export type EditAction =
  | {
      action: "delete" | "cw" | "ccw";
      pages: number[];
    }
  | {
      action: "move";
      pages: number[];
      position: number;
    }
  | {
      action: "duplicate";
      pages: number[];
      position: number;
    };

type PageGroup = { angle: Angle | null; pages: number[] };

function getAngle(rotation: number): Angle | null {
  const angle = normalizeAngle(rotation);

  if (angle === 90) return "cc";
  if (angle === 180) return "hw";
  if (angle === 270) return "ccw";
  return null;
}

/**
 * Convert an array of page numbers into a page range string.
 * In: [3,4,5,6,6,1,2]
 * Out: "3-6,6,1-2"
 */
function createRanges(pages: number[]) {
  const runs: number[][] = [];
  while (pages.length > 0) {
    // Find the next page that is not part of the current run
    let end = pages.findIndex((n, i) => i > 0 && n !== pages[i - 1]! + 1);
    if (end === -1) end = pages.length;
    runs.push(pages.splice(0, end));
  }
  const ranges = runs.map(([first, ...rest]) =>
    rest.length === 0 ? first : [first, rest.at(-1)].join("-"),
  );
  return ranges.join(",");
}

export class EditHistory {
  #getPages: () => Page[];

  entries = $state.raw<Page[][]>([]);

  hasEntries = $derived(this.entries.length > 0);

  current = $derived.by(() => this.entries.at(-1) ?? this.#getPages());

  constructor(getPages: () => Page[]) {
    this.#getPages = getPages;
  }

  edit(edit: EditAction) {
    let pages = [...this.current];
    const { action, pages: ids } = edit;

    switch (action) {
      case "cw":
      case "ccw":
        for (const id of ids) {
          const page = pages.find((p) => p.id === id);
          if (page) pages[pages.indexOf(page)] = page.rotate(action === "cw");
        }
        break;

      case "duplicate":
        const copies = pages
          .filter(({ id }) => ids.includes(id))
          .map((page) => page.copy());
        const duplicateIndex = pages.findIndex(
          ({ id }) => id === edit.position,
        );
        pages.splice(duplicateIndex + 1, 0, ...copies);
        break;

      case "move":
        const pagesToMove = pages.filter(({ id }) => ids.includes(id));
        pages = pages.filter(({ id }) => !ids.includes(id));
        const moveIndex = pages.findIndex(({ id }) => id === edit.position);
        pages.splice(moveIndex + 1, 0, ...pagesToMove);
        break;

      case "delete":
        pages = pages.filter(({ id }) => !ids.includes(id));
        break;
    }

    this.entries = [...this.entries, pages];
  }

  undo() {
    this.entries = this.entries.slice(0, -1);
  }

  discard() {
    this.entries = [];
  }

  serialized = $derived.by<Modification[]>(() => {
    const groupedPages = this.current.reduce<PageGroup[]>(
      (groups, { index, rotation }) => {
        const angle = getAngle(rotation);
        const group = groups.at(-1);

        if (!group || group.angle !== angle) {
          groups.push({ angle, pages: [index] });
        } else {
          group.pages.push(index);
        }
        return groups;
      },
      [],
    );

    return groupedPages.map(({ pages, angle }) => ({
      page: createRanges(pages),
      modifications: angle ? [{ type: "rotate", angle }] : [],
    }));
  });
}
