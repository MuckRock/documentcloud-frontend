<script lang="ts">
  import { _ } from "svelte-i18n";

  import Page from "./Page.svelte";

  import { highlight } from "$lib/utils/search";

  export let page: number;
  export let contents: string;
  export let query: string = ""; // search query
</script>

<Page page_number={page + 1} mode="text" track>
  <pre>
    {@html highlight(contents, query)}
  </pre>
</Page>

<style>
  pre {
    background-color: var(--white, #fff);
    margin: 0;
    padding: 1.5rem;
    text-wrap: pretty;
    word-break: break-word;

    color: var(--gray-5, #233944);
    font-family: var(--font-mono, "Source Code Pro", monospace);
    font-size: calc(var(--font-xs) * var(--zoom, 1));
    line-height: calc(1.25rem * var(--zoom, 1));
    box-shadow: var(--shadow);
    width: 100%;
  }

  pre :global(mark) {
    background: var(--note-public, mark);
  }
</style>
