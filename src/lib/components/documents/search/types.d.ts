import type { FilterFields } from "../Filter.svelte";
import type { SortDirection, SortField } from "../Sort.svelte";

export interface SearchProps {
  filters?: FilterFields;
  sort?: SortField;
  direction?: SortDirection;
}
