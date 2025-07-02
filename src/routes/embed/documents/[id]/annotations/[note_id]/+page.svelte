<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import EmbedLayout from "$lib/components/layouts/EmbedLayout.svelte";
  import Note from "$lib/components/viewer/Note.svelte";

  import { informSize } from "$lib/utils/embed";
  import { pageImageUrl } from "$lib/api/documents";
  import { embedUrl } from "$lib/api/embed";
  import { canonicalNoteUrl, noteUrl } from "$lib/api/notes";

  export let data;

  let elem: HTMLElement;

  $: doc = data.document;
  $: note = data.note;
  $: src = pageImageUrl(doc, note.page_number + 1, "normal").toString();
  $: url = canonicalNoteUrl(doc, note).toString();
  $: viewerUrl = noteUrl(doc, note).href;
  $: title = `${note.title} (${$_("documents.pageAbbrev")} ${
    note.page_number + 1
  })`;

  setContext("document", writable(doc));
  setContext("embed", true);
  setContext("currentMode", writable("note"));
  setContext("pdf", undefined);
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
</svelte:head>

<svelte:window on:load={() => informSize(elem)} />

<div bind:this={elem}>
  <EmbedLayout canonicalUrl={viewerUrl}>
    <div class="card">
      <Note document={writable(doc)} {note} />
    </div>
  </EmbedLayout>
</div>

<style>
  .card {
    margin: 1rem;
    width: calc(100% - 2rem);
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-2);
  }
</style>
