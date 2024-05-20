<script lang="ts">
  import { _ } from "svelte-i18n";

  import Page from "./Page.svelte";

  export let page: number;
  export let contents: string;
</script>

<Page page_number={page + 1} mode="text" track>
  <pre>
    {contents}
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
    font-family: "Source Code Pro", monospace;
    font-size: calc(var(--font-xs) * var(--zoom, 1));
    line-height: calc(1.25rem * var(--zoom, 1));
    box-shadow: var(--shadow);
    width: 100%;
  }
</style>
