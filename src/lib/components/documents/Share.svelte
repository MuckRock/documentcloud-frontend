<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  interface NoteOption {
    value: string | number;
    label: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Check16,
    File16,
    Hash16,
    Note16,
    Sliders16,
    ShieldLock24,
    Organization24,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Copy from "../common/Copy.svelte";
  import CustomizeEmbed, { embedSettings } from "./CustomizeEmbed.svelte";
  import Field from "$lib/components/common/Field.svelte";
  import FieldLabel from "$lib/components/common/FieldLabel.svelte";
  import Number from "$lib/components/inputs/Number.svelte";
  import Select from "$lib/components/inputs/Select.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Text from "$lib/components/inputs/Text.svelte";
  import TextArea from "$lib/components/inputs/TextArea.svelte";
  import Tip from "$lib/components/common/Tip.svelte";

  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import EditAccess from "$lib/components/forms/EditAccess.svelte";

  import {
    canonicalPageUrl,
    canonicalUrl,
    edited,
    embedUrl,
    pageUrl,
  } from "$lib/api/documents";
  import * as embed from "$lib/api/embed";
  import { noteUrl, canonicalNoteUrl } from "$lib/api/notes";
  import { createEmbedSearchParams } from "$lib/utils/embed";
  import { onMount } from "svelte";

  export let document: Document;
  export let page: number = 1;
  export let note_id: undefined | string | number = undefined;
  export let currentTab: "document" | "page" | "note" = "document";

  const noteOptions = document.notes?.map<NoteOption>((note) => ({
    value: note.id,
    label: `pg. ${note.page_number + 1} – ${note.title}`,
  }));

  $: notes = document.notes || [];
  $: note = note_id ? notes?.find((n) => n.id === note_id) : notes[0];

  // dimensions and style for note embeds
  let permalink: URL;
  let embedSrc: URL;
  let iframe: string;

  let customizeEmbedOpen = false;
  let editOpen = false;

  $: access = $edited.get(String(document.id))?.access ?? document.access;
  $: embedUrlParams = createEmbedSearchParams($embedSettings);
  $: {
    switch (currentTab) {
      case "document":
        permalink = canonicalUrl(document);
        embedSrc = embedUrl(document, embedUrlParams);
        iframe = embed.document(document, embedUrlParams);
        break;
      case "page":
        permalink = pageUrl(document, page);
        embedSrc = canonicalPageUrl(document, page, true);
        embedSrc.searchParams.set("embed", "1");
        iframe = embed.page(document, page);
        break;
      case "note":
        if (note) {
          permalink = noteUrl(document, note);
          embedSrc = canonicalNoteUrl(document, note);
          embedSrc.searchParams.set("embed", "1");
          iframe = embed.note(document, note);
        }
        break;
    }
  }

  onMount(() => {
    if (!note_id) {
      // try to set a default note
      note_id = document.notes ? document.notes[0]?.id : undefined;
    }
  });

  function closeEditing() {
    editOpen = false;
  }

  function openEditing() {
    editOpen = true;
  }
</script>

<div class="container">
  {#if access === "private"}
    <div class="banner">
      <Tip mode="danger">
        <ShieldLock24 slot="icon" />
        <div class="privateWarning">
          <div style:flex="1 1 auto">
            {$_("share.privateWarning", { values: { type: "document" } })}
          </div>
          {#if document.edit_access}
            <Button mode="danger" size="small" on:click={openEditing}>
              {$_("share.privateFix")}
            </Button>
          {/if}
        </div>
      </Tip>
    </div>
  {:else if access === "organization"}
    <div class="banner">
      <Tip mode="premium">
        <Organization24 slot="icon" />
        <div class="privateWarning">
          <div style:flex="1 1 auto">
            {$_("share.orgWarning", { values: { type: "document" } })}
          </div>
          {#if document.edit_access}
            <Button mode="danger" size="small" on:click={openEditing}>
              {$_("share.privateFix")}
            </Button>
          {/if}
        </div>
      </Tip>
    </div>
  {/if}
  <div class="left">
    <div class="tabs" role="tablist">
      <Tab
        on:click={() => (currentTab = "document")}
        active={currentTab === "document"}
      >
        <File16 />
        {$_("share.document")}
      </Tab>
      <Tab
        on:click={() => (currentTab = "page")}
        active={currentTab === "page"}
      >
        <Hash16 />
        {$_("share.page")}
      </Tab>
      <Tab
        on:click={() => (currentTab = "note")}
        active={currentTab === "note"}
        disabled={!document.notes || document.notes.length === 0}
      >
        <Note16 />
        {$_("share.note")}
      </Tab>
    </div>
    <div class="fields {currentTab}">
      {#if currentTab === "page"}
        <div class="subselection">
          <Field>
            <FieldLabel>{$_("share.fields.page")}:</FieldLabel>
            <Number bind:value={page} min={1} max={document.page_count} />
          </Field>
        </div>
      {:else if currentTab === "note" && noteOptions && noteOptions.length > 0}
        <div class="subselection">
          <Field>
            <FieldLabel>{$_("share.fields.note")}:</FieldLabel>
            <Select name="note" options={noteOptions} bind:value={note_id} />
          </Field>
        </div>
      {/if}
      <Field>
        <FieldLabel>
          {$_("share.permalink")}
          <Copy slot="action" text={permalink?.href} />
        </FieldLabel>
        <Text
          value={permalink?.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.embed")}
          <Copy slot="action" text={embedSrc?.href} />
        </FieldLabel>
        <Text
          value={embedSrc?.href}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>

      <Field>
        <FieldLabel>
          {$_("share.iframe")}
          <Copy slot="action" text={iframe} />
        </FieldLabel>
        <TextArea
          value={iframe}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
          --resize="vertical"
        />
      </Field>
    </div>
  </div>
  <div class="right">
    <header>
      <FieldLabel>
        {$_("share.preview")}
        <div slot="action">
          {#if customizeEmbedOpen}
            <Button
              size="small"
              ghost
              mode="primary"
              on:click={() => (customizeEmbedOpen = false)}
            >
              <Check16 />
              {$_("share.save")}
            </Button>
          {:else}
            <Button
              size="small"
              ghost
              mode="primary"
              on:click={() => (customizeEmbedOpen = true)}
              disabled={currentTab !== "document"}
            >
              <Sliders16 />
              {$_("share.customize")}
            </Button>
          {/if}
        </div>
      </FieldLabel>
    </header>
    <main>
      {#if customizeEmbedOpen}
        <div class="embedSettings">
          <CustomizeEmbed />
        </div>
      {:else}
        <iframe class="embed" title="Embed Preview" src={embedSrc?.toString()}
        ></iframe>
      {/if}
    </main>
  </div>
</div>
{#if editOpen}
  <Portal>
    <Modal on:close={closeEditing}>
      <h1 slot="title">{$_("access.edit")}</h1>
      <EditAccess {document} on:close={closeEditing} />
    </Modal>
  </Portal>
{/if}

<style>
  .container {
    width: 100%;
    height: 32rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 0 1rem;
  }
  .banner {
    grid-column: 1/3;
    grid-row: 1/2;
    margin-bottom: 1rem;
  }
  .privateWarning {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .tabs {
    display: flex;
    gap: 0.5rem;
    flex: 0 1 auto;
    padding: 0 1rem;
  }
  .fields {
    flex: 1 1 auto;
    display: flex;
    padding: var(--font-md, 1rem);
    flex-direction: column;
    gap: var(--font-md, 1rem);
    flex: 1 0 0;
    align-self: stretch;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    background: var(--gray-1);
    overflow-y: auto;
  }
  .right,
  .left {
    display: flex;
    flex-direction: column;
    flex: 1 1 12rem;
    grid-row: 2/3;
    min-width: 0;
  }
  .right {
    flex: 2 1 24rem;
  }
  .right header {
    padding: 0.375rem 0;
    /* margin-bottom: .25rem; */
  }
  .right main {
    min-height: 0;
    height: 100%;
    width: 100%;
  }
  .subselection {
    background: var(--white);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-1);
  }
  iframe.embed {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }
  .embedSettings {
    padding: 0 0.5em;
    background: var(--gray-1);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    height: 100%;
    overflow-y: auto;
  }
</style>
