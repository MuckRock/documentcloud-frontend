<script lang="ts">
  import { Check16, Copy16, File16, Hash16, Note16, Note24, Sliders16 } from "svelte-octicons";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../common/Field.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Empty from "../common/Empty.svelte";
  import Tab from "../common/Tab.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";
  import Select from "../inputs/Select.svelte";
  import Number from "../inputs/Number.svelte";
  import type { Document, Note } from "@/lib/api/types";
  import CustomizeEmbed, {embedSettings} from "./CustomizeEmbed.svelte";
  import { createEmbedSearchParams } from "@/lib/utils/embed";
  import { APP_URL, EMBED_URL } from "@/config/config";
  import { canonicalPageUrl, canonicalUrl, pageUrl } from "@/lib/api/documents";
  import { canonicalNoteUrl, noteUrl } from "@/lib/api/notes";
  import { embedUrl } from "@/api/embed";

  export let document: Document;
  export let page: number = 1;
  export let note: string | number = null;
  
  interface NoteOption {
    value: string | number;
    label: string;
  }
  const noteOptions = document.notes?.map<NoteOption>(note => ({
    value: note.id,
    label: `pg. ${note.page_number + 1} – ${note.title}`
  }));
  let selectedNote: NoteOption = note ? noteOptions?.find(({value}) => value === note) : noteOptions?.[0];
  // bind the selected note to the note prop
  $: {
    note = selectedNote.value;
  }

  export let currentTab: "document" | "page" | "note" = "document";
  function setCurrentTab(tab: typeof currentTab) {
    currentTab = tab;
  }

  let permalink: URL, embedSrc: URL, iframe: string, wpShortcode: string;
  let customizeEmbedOpen = false;
  $: embedUrlParams = createEmbedSearchParams($embedSettings);
  $: {
    switch(currentTab) {
      case 'document':
        permalink = canonicalUrl(document);
        embedSrc = canonicalUrl(document);
        iframe = `<iframe src="${embedSrc}?${embedUrlParams.toString()}"`;
        wpShortcode = `[documentcloud url="${embedSrc}" ${Array.from(embedUrlParams).slice(1).map(([key, value]) => `${key}="${value}"`).join(' ')}]`;
        if ($embedSettings.width) {
          iframe += ` width="${$embedSettings.width}"`
        }
        if ($embedSettings.height) {
          iframe += ` height="${$embedSettings.height}"`
        }
        iframe += ' />';
        break;
      case 'page':
        permalink = pageUrl(document, page);
        embedSrc = canonicalPageUrl(document, page);
        iframe = `<iframe src="${embedSrc}" />`
        wpShortcode = `[documentcloud url="${embedSrc}"]`;
        break;
      case 'note':
        const noteObject = document.notes.find(({id}) => String(id) === String(selectedNote.value));
        permalink = noteUrl(document, noteObject);
        embedSrc = canonicalNoteUrl(document, noteObject)
        iframe = `<iframe src="${embedSrc}" />`
        wpShortcode = `[documentcloud url="${embedSrc}"]`;
        break;
    }
  };

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }
</script>

<div class="container">
  <div class="left">
    <div class="tabs">
      <Flex>
        <Tab on:click={() => setCurrentTab("document")} active={currentTab === "document"}>
          <File16 /> Document
        </Tab>
        <Tab on:click={() => setCurrentTab("page")} active={currentTab === "page"}>
          <Hash16 /> Page
        </Tab>
        <Tab on:click={() => setCurrentTab("note")} active={currentTab === "note"} disabled={document.notes.length === 0}>
          <Note16 /> Note
        </Tab>
      </Flex>
    </div>
    <div class="fields {currentTab}">
      {#if currentTab === "page"}
      <div class="subselection">
        <Field>
          <FieldLabel>
            Pick page:
          </FieldLabel>
          <Number bind:value={page} min={1} max={document.page_count} />
        </Field>
      </div>
      {:else if currentTab === "note"}
      <div class="subselection">
        <Field>
          <FieldLabel>
            Pick note:
          </FieldLabel>
          <Select name="note" items={noteOptions} bind:value={selectedNote} />
        </Field>
      </div>
      {/if}
      <Field>
        <FieldLabel>
          Permalink
          <Button slot="action" size="small" mode="ghost" on:click={() => copy(String(permalink))} disabled={!navigator.clipboard}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <Text value={String(permalink)} --font-family="var(--font-mono)" --font-size="var(--font-sm)" />
      </Field>
      <Field>
        <FieldLabel>
          WordPress Shortcode
          <Button slot="action" size="small" mode="ghost" on:click={() => copy(wpShortcode)} disabled={!navigator.clipboard}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <Text
          value={wpShortcode}
          --font-family="var(--font-mono)"
          --font-size="var(--font-sm)"
        />
      </Field>
      <Field>
        <FieldLabel>
          Embed HTML iFrame
          <Button slot="action" size="small" mode="ghost" on:click={() => copy(iframe)} disabled={!navigator.clipboard}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <TextArea value={iframe} --font-family="var(--font-mono)" --font-size="var(--font-sm)" --resize="vertical" />
      </Field>
    </div>
  </div>
  <div class="right">
    <header>
      <FieldLabel>
        Embed Preview
        <div slot="action">
          {#if customizeEmbedOpen}
          <Button size="small" mode="ghost" on:click={() => customizeEmbedOpen = false}>
            <Check16 /> Save Settings
          </Button>
          {:else}
          <Button size="small" mode="ghost" on:click={() => customizeEmbedOpen = true} disabled={currentTab !== 'document'}>
            <Sliders16 /> Customize Embed
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
        {#if currentTab === 'note' && note === null}
        <Empty icon={Note24}>
          <p>Select a note to preview its embed</p>
        </Empty>
        {:else}
        <iframe class="embed" title="Embed Preview" src={embedSrc.toString()} />
        {/if}
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
  .right, .left {
    display: flex;
    flex-direction: column;
    flex: 1 1 12rem;
  }
  .right {
    flex: 2 1 24rem;
  }
  .right header {
    padding: .375rem 0;
    /* margin-bottom: .25rem; */
  }
  .right main {
    min-height: 0;
    height: 100%;
    width: 100%
  }
  .subselection {
    background: var(--white);
    padding: 1rem;
    border-radius: .5rem;
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
    padding: 0 .5em;
    background: var(--gray-1);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
    height: 100%;
    overflow-y: auto;
  }
</style>