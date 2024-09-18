<script lang="ts">
  import type { Document, Note, ViewerMode } from "$lib/api/types";

  import "@/style/kit.css";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  import { embedUrl } from "$lib/api/embed";
  import { canonicalUrl, pageImageUrl } from "@/lib/api/documents";

  export let data;

  const currentPage: Writable<number> = writable(1);
  const activeNote: Writable<Note> = writable(null);
  const currentMode: Writable<ViewerMode> = writable(data.mode);

  setContext<Document>("document", data.document);
  // stores we need deeper in the component tree, available via context
  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);
  setContext("currentMode", currentMode);

  $: document = data.document;
  $: canonical_url = canonicalUrl(document).href;
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={canonical_url} />

  {#if document.noindex || document.admin_noindex}
    <meta name="robots" content="noindex" />
  {/if}
  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:url" content={canonical_url} />
  <meta property="og:title" content={document.title} />
  <title>{document.title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(document.canonical_url).href}
    title={document.title}
  />
  {#if document?.description?.trim().length > 0}
    <meta property="og:description" content={document.description} />
  {/if}
  <meta
    property="og:image"
    content={pageImageUrl(document, 0, "normal").href}
  />
</svelte:head>

<slot />
