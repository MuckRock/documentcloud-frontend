export type Maybe<T> = T | undefined;

export type Nullable<T> = T | null;

export interface Page<T> {
  count?: number;
  next: Nullable<string>;
  previous: Nullable<string>;
  results: T[];
  escaped?: boolean;
}

export interface PageParams {
  cursor?: string;
  per_page?: number;
}
