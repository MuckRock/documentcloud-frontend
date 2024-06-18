<script lang="ts">
  import type { Note, Redaction, ViewerMode } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/stores";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import { _ } from "svelte-i18n";
  import { Check16, SquareFill24, Undo16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Paginator, { currentPage } from "../components/ViewerPaginator.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import PDF from "$lib/components/documents/PDF.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import Zoom, { zoom, zoomToScale } from "../components/Zoom.svelte";

  import { canonicalUrl, pageFromHash } from "$lib/api/documents";
  import { noteFromHash } from "$lib/api/notes";
  import { scrollToPage } from "$lib/utils/scroll";

  export let data;

  // stores we need deeper in the component tree, available via context
  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("redacting"); // only ever one mode on this route

  setContext("activeNote", activeNote);
  setContext("currentPage", currentPage);
  setContext("mode", mode);

  let redactions: Redaction[] = [];

  $: asset_url = data.asset_url;
  $: document = data.document;
  $: action = new URL("?/redact", canonicalUrl(document)).href;

  // lifecycle
  afterNavigate(() => {
    const { hash } = $page.url;

    $currentPage = pageFromHash(hash);

    if ($currentPage > 1) {
      scrollToPage($currentPage);
    }

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  });

  function onHashChange(e: HashChangeEvent) {
    const { hash } = new URL(e.newURL);
    $currentPage = pageFromHash(hash);
    scrollToPage($currentPage);

    const noteId = noteFromHash(hash);
    if (noteId) {
      $activeNote = document.notes.find((note) => note.id === noteId);
    }
  }

  async function onSubmit({
    formElement,
    formData,
    action,
    cancel,
    submitter,
  }) {}
</script>

<svelte:window on:hashchange={onHashChange} />

<svelte:head>
  <link
    rel="preload"
    href={asset_url.href}
    as="fetch"
    crossorigin="anonymous"
    type="application/pdf"
  />
</svelte:head>

<ContentLayout>
  <svelte:fragment slot="header">
    <Tip --background-color="var(--yellow-bright)">
      <SquareFill24 slot="icon" />
      <h3>{$_("redact.title")}</h3>
      <p>{$_("redact.instructions")}</p>
    </Tip>
  </svelte:fragment>

  <PDF {document} {asset_url} scale={zoomToScale($zoom)} />

  <PageToolbar slot="footer">
    <svelte:fragment slot="left">
      <form method="post" {action} use:enhance={onSubmit}>
        <!-- additional controls here -->
        <Button type="submit" mode="primary" size="small">
          <Check16 />
          {$_("redact.confirm")}
        </Button>
        <Button type="reset" size="small">
          <Undo16 />
          {$_("redact.undo")}
        </Button>
      </form>
    </svelte:fragment>

    <Paginator slot="center" totalPages={document.page_count} />

    <Zoom slot="right" mode={$mode} />
  </PageToolbar>
</ContentLayout>
