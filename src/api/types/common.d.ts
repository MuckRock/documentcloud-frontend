export type Nullable<T> = T | null;

export interface Page<T> {
  count: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
}
