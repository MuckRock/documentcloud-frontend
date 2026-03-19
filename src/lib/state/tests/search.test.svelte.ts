/**
 * Tests demonstrating how $effect integrates with SearchResultsState.setResults,
 * mirroring the pattern used in the documents page route:
 *
 *   $effect(() => { search.setResults(data.searchResults); })
 *
 * Uses the .svelte.ts extension so that Svelte rune syntax ($state, $effect.root)
 * is compiled correctly.
 */
import type { DocumentResults } from "$lib/api/types";
import { describe, it, expect } from "vitest";
import { flushSync } from "svelte";

import { SearchResultsState } from "$lib/state/search.svelte";
import searchFixture from "@/test/fixtures/documents/search-highlight.json";

const fixture = searchFixture as unknown as DocumentResults;

describe("SearchResultsState with $effect", () => {
  it("loads initial results when effect fires", async () => {
    const initialResults = Promise.resolve({ data: fixture });
    let resultsSource = $state(initialResults);

    const search = new SearchResultsState({ loading: true });
    const cleanup = $effect.root(() => {
      $effect(() => {
        search.setResults(resultsSource);
      });
    });

    flushSync();
    await initialResults;

    expect(search.visible.size).toBe(fixture.results.length);
    expect(search.total).toBe(fixture.count);
    expect(search.loading).toBe(false);

    cleanup();
  });

  it("re-syncs when source changes (simulating SvelteKit navigation)", async () => {
    const partial: DocumentResults = {
      ...fixture,
      results: fixture.results.slice(0, 2),
      count: 2,
      next: null,
    };

    const initialResults = Promise.resolve({ data: fixture });
    let resultsSource = $state(initialResults);

    const search = new SearchResultsState({ loading: true });
    const cleanup = $effect.root(() => {
      $effect(() => {
        search.setResults(resultsSource);
      });
    });

    flushSync();
    await initialResults;
    expect(search.visible.size).toBe(fixture.results.length);

    const nextResults = Promise.resolve({ data: partial });
    resultsSource = nextResults;
    flushSync();
    await nextResults;

    expect(search.visible.size).toBe(2);
    expect(search.total).toBe(2);

    cleanup();
  });
});
