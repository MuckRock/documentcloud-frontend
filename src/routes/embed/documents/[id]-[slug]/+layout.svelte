<script lang="ts">
  import type { ViewerMode, Note } from "$lib/api/types";

  import { type Writable, writable } from "svelte/store";

  import { canonicalUrl } from "$lib/api/documents";
  import { setContext } from "svelte";

  export let data;

  $: document = data.document;
  $: canonical_url = canonicalUrl(document).href;

  const activeNote: Writable<Note> = writable(null);
  const currentPage: Writable<number> = writable(1);
  const currentMode: Writable<ViewerMode> = writable(data.mode);

  // stores we need deeper in the component tree, available via context
  setContext("activeNote", activeNote);
  setContext("currentPage", currentPage);
  setContext("currentMode", currentMode);
</script>

<svelte:head>
  <title>{document.title} | DocumentCloud</title>

  <!-- Insert canonical URL -->
  <link rel="canonical" href={canonical_url} />

  {#if document.noindex || document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
</svelte:head>

<slot />
