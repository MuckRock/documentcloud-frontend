import type { Page, SavedSearch } from "$lib/api/types";

export const savedSearch: SavedSearch = {
  uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "Police reports",
  query: "police report",
  created_at: "2026-01-15T10:30:00Z",
  updated_at: "2026-01-15T10:30:00Z",
};

export const savedSearch2: SavedSearch = {
  uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  name: "FOIA requests",
  query: "foia request",
  created_at: "2026-02-01T14:00:00Z",
  updated_at: "2026-02-01T14:00:00Z",
};

export const savedSearches: SavedSearch[] = [savedSearch, savedSearch2];

export const savedSearchPage: Page<SavedSearch> = {
  count: 2,
  next: null,
  previous: null,
  results: [savedSearch, savedSearch2],
};

export const emptySavedSearchPage: Page<SavedSearch> = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};
