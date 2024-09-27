<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Note, ViewerMode } from "$lib/api/types.js";

  import { afterNavigate, invalidate } from "$app/navigation";
  import { page } from "$app/stores";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import DocumentLayout from "$lib/components/layouts/DocumentLayout.svelte";

  // config and utils
  import { shouldPreload } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";

  export let data;

  const activeNote: Writable<Note> = getContext("activeNote");
  const currentMode: Writable<ViewerMode> = getContext("currentMode");

  $: document = data.document;
  $: asset_url = data.asset_url;
  $: query = data.query;
  $: text = data.text;
  $: action = data.action;
  $: $currentMode = data.mode; // set $currentMode from URL search param
  $: addons = data.pinnedAddons;

  function setCurrentNoteFromHash(url: URL) {
    const { hash } = url;
    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }

  // Navigation Lifecycle
  afterNavigate(() => {
    setCurrentNoteFromHash($page.url);
  });

  // Pagination Lifecycle
  function onHashChange(e: HashChangeEvent) {
    setCurrentNoteFromHash(new URL(e.newURL));
  }
</script>

<svelte:window on:hashchange={onHashChange} />
<svelte:head>
  {#if shouldPreload($currentMode)}
    <link
      rel="preload"
      href={data.asset_url.href}
      as="fetch"
      crossorigin="anonymous"
      type="application/pdf"
    />
  {/if}
</svelte:head>

<DocumentLayout {document} {asset_url} {text} {query} {action} {addons} />
