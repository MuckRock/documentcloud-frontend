<script lang="ts">
  import { page } from "$app/stores";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import EmbedLayout from "$lib/components/layouts/EmbedLayout.svelte";
  import Note from "$lib/components/notes/Note.svelte";

  import { informSize } from "$lib/utils/embed";
  import { pageImageUrl } from "$lib/api/documents";
  import { embedUrl } from "$lib/api/embed";
  import { canonicalNoteUrl, noteUrl } from "$lib/api/notes";
  import { SIZE } from "$lib/utils/notes";

  export let data;

  let embedContainer: HTMLElement;

  $: doc = data.document;
  $: note = data.note;
  $: src = pageImageUrl(doc, note.page_number + 1, "normal").toString();
  $: url = canonicalNoteUrl(doc, note).toString();
  $: viewerUrl = noteUrl(doc, note).href;
  $: title = `${note.title} (${$_("documents.pageAbbrev")} ${
    note.page_number + 1
  })`;
  $: debug = $page?.url?.searchParams?.has("debug") ?? false;

  setContext("document", writable(doc));
  setContext("embed", true);
  setContext("currentMode", writable("note"));
  setContext("pdf", undefined);

  onMount(() => {
    if (window.document.readyState === "complete") {
      informSize({ element: embedContainer, timeout: 500, debug });
    }
  });
</script>

<svelte:head>
  <!-- Insert canonical URL -->
  <link rel="canonical" href={url} />

  <!-- Social cards -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="og:url" content={url} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <title>{title} - DocumentCloud</title>
  <link
    rel="alternate"
    type="application/json+oembed"
    href={embedUrl(url).toString()}
    {title}
  />
  {#if note.content}
    <meta property="og:description" content={note.content} />
  {/if}
  <meta property="og:image" content={src} />

  <link rel="prefetch" href={pageImageUrl(doc, note.page_number + 1, SIZE)} />
</svelte:head>

<svelte:window
  on:load={() => informSize({ element: embedContainer, timeout: 500, debug })}
/>

<div class="embed-container">
  <EmbedLayout canonicalUrl={viewerUrl} type="note">
    <div class="note-container" bind:this={embedContainer}>
      <div class="card">
        <Note document={writable(doc)} {note} />
      </div>
    </div>
  </EmbedLayout>
</div>

<style>
  .embed-container {
    min-height: 100vh;
  }
  .note-container {
    min-height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    height: fit-content;
    padding-bottom: 2.5rem;
  }
  .card {
    margin: 1rem;
    width: calc(100% - 2rem);
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }
</style>
