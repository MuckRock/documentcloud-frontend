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
    padding: 1rem;
  }

  .page pre {
    background-color: var(--white, #fff);
    padding: 1rem;
    text-wrap: pretty;
  }

  h4 a {
    color: var(--black);
    text-decoration: none;
  }

  h4 a:hover {
    text-decoration: underline;
  }
</style>
