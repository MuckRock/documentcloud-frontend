<script lang="ts">
  import type { ViewerMode } from "@/lib/api/types";

  import { _ } from "svelte-i18n";

  import { pageHashUrl } from "$lib/api/documents";

  export let page_number: number;
  export let mode: ViewerMode = "document";

  $: id = pageHashUrl(page_number).replace("#", "");
  $: href = `?mode=${mode}` + pageHashUrl(page_number);
</script>

<div class="page">
  <h4 {id}>
    <a {href}>
      {$_("documents.pageAbbrev")}
      {page_number}
    </a>
  </h4>
  <slot {id} {href} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: center;
    gap: var(--font-m, 1rem);
    padding: 0 1rem;
    margin: 0.75rem 0 0;
    max-width: 100%;
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
