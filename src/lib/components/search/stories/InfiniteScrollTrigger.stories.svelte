<script module lang="ts">
  import type { DocumentResults } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import InfiniteScrollTrigger from "../InfiniteScrollTrigger.svelte";
  import SearchResultsCount from "../SearchResultsCount.svelte";
  import { SearchResultsState } from "$lib/state/search.svelte";

  import searchResults from "@/test/fixtures/documents/search-highlight.json";
  const results = searchResults as unknown as DocumentResults;

  // Populate visible/total synchronously (rather than via `setResults`, which
  // is async and flips `loading` back to false as soon as its promise
  // resolves) so each story's `loading`/`next` state is stable at render time.
  function makeSearch() {
    const search = new SearchResultsState();
    for (const d of results.results) {
      search.visible.set(String(d.id), d);
    }
    search.total = results.count!;
    search.hasTotal = true;
    search.next = results.next;
    return search;
  }

  const loading = makeSearch();
  loading.loading = true;

  const errored = makeSearch();
  async function failNext() {
    return { status: 500, message: "Something went wrong" };
  }

  const idle = makeSearch();
  idle.next = null;
  async function noMoreResults() {
    return undefined;
  }

  const scrolling = makeSearch();
  let scrollPage = 0;
  async function loadMore() {
    await new Promise((resolve) => setTimeout(resolve, 600));
    scrollPage += 1;
    for (const d of results.results.slice(0, 5)) {
      const id = `${d.id}-page-${scrollPage}`;
      scrolling.visible.set(id, { ...d, id });
    }
    scrolling.total += 5;
    // stop after a few pages so the story settles
    scrolling.next = scrollPage < 3 ? "has-more" : null;
    return undefined;
  }

  const { Story } = defineMeta({
    title: "Search / Infinite Scroll Trigger",
    component: InfiniteScrollTrigger,
  });
</script>

<Story name="Loading" args={{ search: loading }} />

<Story name="Error" args={{ search: errored, onNext: failNext }} />

<Story
  name="Idle (No More Results)"
  args={{ search: idle, onNext: noMoreResults }}
/>

<Story name="Loads More On Scroll" asChild>
  <div style="display: flex; flex-direction: column;">
    <SearchResultsCount search={scrolling} />
    <div
      style="height: 150vh; display: flex; align-items: flex-end; justify-content: center; color: var(--gray-6, #888);"
    >
      Scroll down to load more
    </div>
    <InfiniteScrollTrigger search={scrolling} onNext={loadMore} />
  </div>
</Story>
