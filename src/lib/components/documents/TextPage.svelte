<script lang="ts">
  import { _ } from "svelte-i18n";

  export let page: number;
  export let contents: string;
</script>

<div class="page">
  <h4 id="p{page + 1}">
    <a href="#p{page + 1}">{$_("documents.pageAbbrev")} {page + 1}</a>
  </h4>

  <pre>
    {contents}
  </pre>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    gap: var(--font-m, 1rem);
    padding: 0 1rem;
    margin: 0.75rem 0;
    max-width: 100%;
  }

  .page pre {
    background-color: var(--white, #fff);
    margin: 0;
    padding: 1.5rem;
    text-wrap: pretty;

    color: var(--gray-5, #233944);
    font-family: "Source Code Pro", monospace;
    font-size: calc(var(--font-xs) * var(--zoom, 1));
    line-height: calc(1.25rem * var(--zoom, 1));
    box-shadow: var(--shadow);
    width: 100%;
  }

  h4,
  h4 a {
    color: var(--gray-4, #5c717c);
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }
</style>
