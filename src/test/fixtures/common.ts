import type { Page } from "../../api/types/common";

export const emptyList: Page<undefined> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};
