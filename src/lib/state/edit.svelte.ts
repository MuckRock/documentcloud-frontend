import type { Modification, Angle } from "$lib/api/types";
import type { Page } from "$lib/utils/page.svelte";
import { pagesFromSpec } from "$lib/utils/pageSize";

export type Edit = "up" | "down" | "cw" | "ccw" | "duplicate" | "delete";

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

const getAngle = (rotation: number): Angle | null => {
  let angle = rotation % 360;
  if (angle < 0) angle += 360;

  if (angle === 90) return "cc";
  if (angle === 180) return "hw";
  if (angle === 270) return "ccw";
  return null;
};

export class EditHistory {
  #getPageSpec: () => string | undefined;

  #original = $derived.by(() => {
    const pageSpec = this.#getPageSpec();
    return pageSpec ? pagesFromSpec(pageSpec) : [];
  });

  entries = $state.raw<Page[][]>([]);

  hasEntries = $derived(this.entries.length > 0);

  current = $derived(this.entries.at(-1) ?? this.#original);

  constructor(getPageSpec: () => string | undefined) {
    this.#getPageSpec = getPageSpec;
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
    const groupedPages = this.current.reduce(
      (acc, { index, rotation }) => {
        const angle = getAngle(rotation);
        const group = acc.at(-1);

        if (!group || group.angle !== angle) {
          acc.push({ angle, pages: [index] });
        } else {
          group.pages.push(index);
        }
        return acc;
      },
      [] as { angle: Angle | null; pages: number[] }[],
    );

    return groupedPages.map(({ pages, angle }) => ({
      page: pages.toString(),
      modifications: angle ? [{ type: "rotate", angle }] : [],
    }));
  });
}
