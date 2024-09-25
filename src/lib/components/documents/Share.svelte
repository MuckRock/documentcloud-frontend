<script context="module" lang="ts">
  import type { Document } from "@/lib/api/types";

  interface NoteOption {
    value: string | number;
    label: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Check16,
    Copy16,
    File16,
    Hash16,
    Note16,
    Sliders16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Tab from "../common/Tab.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";
  import Select from "../inputs/Select.svelte";
  import Number from "../inputs/Number.svelte";
  import CustomizeEmbed, { embedSettings } from "./CustomizeEmbed.svelte";

  import { createEmbedSearchParams } from "@/lib/utils/embed";
  import {
    canonicalPageUrl,
    canonicalUrl,
    embedUrl,
    pageUrl,
  } from "@/lib/api/documents";
  import { canonicalNoteUrl, noteUrl } from "@/lib/api/notes";
  import { toast } from "../layouts/Toaster.svelte";

  export let document: Document;
  export let page: number = 1;
  export let note: string | number = null;
  export let currentTab: "document" | "page" | "note" = "document";

  const noteOptions = document.notes?.map<NoteOption>((note) => ({
    value: note.id,
    label: `pg. ${note.page_number + 1} – ${note.title}`,
  }));

  let selectedNote: NoteOption = note
    ? noteOptions?.find(({ value }) => value === note)
    : noteOptions?.[0];

  // bind the selected note to the note prop
  $: {
    note = selectedNote?.value ?? null;
  }

  let permalink: URL;
  let embedSrc: URL;
  let iframe: string;
  // let wpShortcode: string; is broken in WordPress

  let customizeEmbedOpen = false;
  $: embedUrlParams = createEmbedSearchParams($embedSettings);
  $: {
    switch (currentTab) {
      case "document":
        permalink = canonicalUrl(document);
        embedSrc = embedUrl(document, embedUrlParams);

        iframe = `<iframe src="${embedSrc.href}"`;
        /*
        wpShortcode = `[documentcloud url="${embedSrc.href}" ${Array.from(
          embedUrlParams,
        )
          .slice(1)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ")}]`;
        */
        if ($embedSettings.width) {
          iframe += ` width="${$embedSettings.width}"`;
        }
        if ($embedSettings.height) {
          iframe += ` height="${$embedSettings.height}"`;
        }
        iframe += " />";
        break;
      case "page":
        permalink = pageUrl(document, page);
        embedSrc = canonicalPageUrl(document, page);
        embedSrc.searchParams.set("embed", "1");
        iframe = `<iframe src="${embedSrc.href}" />`;
        // wpShortcode = `[documentcloud url="${embedSrc}"]`;
        break;
      case "note":
        const noteObject = document.notes?.find(
          ({ id }) => String(id) === String(selectedNote.value),
        );
        if (noteObject) {
          permalink = noteUrl(document, noteObject);
          embedSrc = canonicalNoteUrl(document, noteObject);
          embedSrc.searchParams.set("embed", "1");
          iframe = `<iframe src="${embedSrc.href}" />`;
          // wpShortcode = `[documentcloud url="${embedSrc}"]`;
        }
        break;
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast($_("share.copiedToClipboard"));
  }
</script>

<div class="container">
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
      {:else if currentTab === "note" && noteOptions.length > 0}
        <div class="subselection">
          <Field>
            <FieldLabel>{$_("share.fields.note")}:</FieldLabel>
            <Select name="note" items={noteOptions} bind:value={selectedNote} />
          </Field>
        </div>
      {/if}
      <Field>
        <FieldLabel>
          {$_("share.permalink")}
          <Button
            slot="action"
            size="small"
            ghost
            mode="primary"
            on:click={() => copy(String(permalink))}
            disabled={!navigator.clipboard}
          >
            <Copy16 />
            {$_("share.copy")}
          </Button>
        </FieldLabel>
        <Text
          value={String(permalink)}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>
      <!-- wp shortcode is broken at the moment
      <Field>
        <FieldLabel>
          WordPress Shortcode
          <Button
            slot="action"
            size="small"
            ghost mode="primary"
            on:click={() => copy(wpShortcode)}
            disabled={!navigator.clipboard}
          >
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <Text
          value={wpShortcode}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field> 
      -->

      <Field>
        <FieldLabel>
          {$_("share.iframe")}
          <Button
            slot="action"
            size="small"
            ghost
            mode="primary"
            on:click={() => copy(iframe)}
            disabled={!navigator.clipboard}
          >
            <Copy16 />
            {$_("share.copy")}
          </Button>
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
        <iframe class="embed" title="Embed Preview" src={embedSrc.toString()} />
      {/if}
    </main>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 32rem;
    display: flex;
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
