import type { Page } from "$lib/api/types";

export const emptyList: Page<undefined> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};
