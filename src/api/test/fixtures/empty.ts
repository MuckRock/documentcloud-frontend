import { Page } from "../types/common";

export const emptyList: Page<never> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};
