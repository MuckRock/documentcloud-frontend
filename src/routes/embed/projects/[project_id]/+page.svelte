<script lang="ts">
  import type { Document } from "$lib/api/types";
  import DocumentListItem from "$lib/components/documents/DocumentListItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";

  export let data;

  let page = 0;
  let per_page = 12;

  $: project = data.project;
  $: count = data.documents.count;
  $: next = data.documents.next;
  $: previous = data.documents.previous;
  $: documents = data.documents.results.map((d) => d.document) as Document[];
  $: total_pages = Math.ceil(count / per_page);

  async function load(url) {
    const res = await fetch(url, { credentials: "include" }).catch((e) => {
      console.error(e);
      return { ok: false, json: () => {} };
    });

    if (!res.ok) {
      return;
    }

    data.documents = await res.json();
  }

  function load_next(e) {
    page = Math.min(total_pages, page + 1);
    load(next);
  }

  function load_previous(e) {
    page = Math.max(0, page - 1);
    load(previous);
  }
</script>

<div class="dc-project-embed">
  <header>
    <h1>{project.title}</h1>
  </header>

  <div class="documents">
    {#each documents as document (document.id)}
      <DocumentListItem {document} />
    {/each}
  </div>

  <footer>
    <Paginator
      totalPages={count}
      page={page + 1}
      has_next={Boolean(next)}
      has_previous={Boolean(previous)}
      on:next={load_next}
      on:previous={load_previous}
    />
  </footer>
</div>

<style>
  header {
    padding: 1rem;
  }

  .documents {
    padding: 1rem;
  }

  @media (min-width: 720px) {
    .documents {
      column-count: 3;
    }
  }
</style>
