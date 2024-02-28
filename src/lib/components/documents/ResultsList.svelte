<script lang="ts">
  import type { Document, DocumentResults } from "$lib/api/types";
  import DocumentListItem from "./DocumentListItem.svelte";

  export let results: DocumentResults = {
    results: [],
    count: 0,
    next: null,
    previous: null,
    escaped: false,
  };
</script>

<div class="results">
  {#each results.results as document (document.id)}
    <div class="row">
      <input type="checkbox" />
      <DocumentListItem {document} />
    </div>
  {/each}
</div>
