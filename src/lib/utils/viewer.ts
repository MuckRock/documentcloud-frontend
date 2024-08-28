import type { Sizes, ViewerMode, Zoom } from "$lib/api/types";
import { unwrapFunctionStore, _ } from "svelte-i18n";

const $_ = unwrapFunctionStore(_);

/**
 * Generate a default zoom, based on mode
 * @param mode
 */
export function getDefaultZoom(mode: ViewerMode): Zoom {
  switch (mode) {
    case "document":
      return "width";

    case "annotating":
      return "width";

    case "redacting":
      return "width";

    case "grid":
      return "small";

    default:
      return 1;
  }
}

/**
 * Generate zoom levels based on mode, since each zooms in a slightly different way
 */
export function getZoomLevels(mode: ViewerMode): (string | number)[][] {
  switch (mode) {
    case "document":
    case "annotating":
    case "redacting":
      return [
        ["width", $_("zoom.fitWidth")],
        ["height", $_("zoom.fitHeight")],
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];

    case "text":
      return [
        [0.5, "50%"],
        [0.75, "75%"],
        [1, "100%"],
        [1.25, "125%"],
        [1.5, "150%"],
        [2, "200%"],
      ];

    case "grid":
      return [
        ["thumbnail", $_("zoom.thumbnail")],
        ["small", $_("zoom.small")],
        ["normal", $_("zoom.normal")],
        ["large", $_("zoom.large")],
      ];

    default:
      // todo: notes, maybe
      return [];
  }
}
