<script lang="ts">
  import { Copy16, File16, Hash16, Note16, Sliders16 } from "svelte-octicons";
  import Flex from "../common/Flex.svelte";
  import Tab from "../common/Tab.svelte";
  import Field from "../common/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";
  import Button from "../common/Button.svelte";
  import TextArea from "../inputs/TextArea.svelte";
  import Select from "../inputs/Select.svelte";
  import Number from "../inputs/Number.svelte";
  import type { Document } from "@/lib/api/types";
  import { assetUrl } from "@/lib/api/documents";

  export let document: Document;
  export let page: number = null;
  export let note: string | number = null;
  
  export let currentTab: "document" | "page" | "note" = "document";
  function setCurrentTab(tab: typeof currentTab) {
    currentTab = tab;
  }

  const notes = document.notes.map(note => ({
    value: note.id,
    label: `pg. ${note.page_number + 1} – ${note.title}`
  }));
  // $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
  //   embed: embedded ? 1 : null,
  //   responsive: responsive,
  //   sidebar: sidebarBehavior,
  //   title: titleBehavior,
  //   pdf: pdfBehavior,
  //   fullscreen: fullscreenBehavior,
  //   text: textBehavior,
  //   onlyshoworg: onlyOrgBehavior,
  // });
  // $: linkUrl = queryBuilder(embedUrl, {
  //   embed: null,
  // });

  async function getDocumentAssetUrl() {
    return assetUrl(document);
  }

  let assetUrlPromise = getDocumentAssetUrl();

  function copyPermalink(e: Event) {
    console.debug('copy permalink');
  }

  function copyShortcode(e: Event) {
    console.debug('copy shortcode');
  }

  function copyHtml(e: Event) {
    console.debug('copy html');
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
        <Tab on:click={() => setCurrentTab("note")} active={currentTab === "note"}>
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
          <Number value={page ?? 1} min={1} max={document.page_count} />
        </Field>
      </div>
      {:else if currentTab === "note"}
      <div class="subselection">
        <Field>
          <FieldLabel>
            Pick note:
          </FieldLabel>
          <Select name="note" items={notes} value={note} />
        </Field>
      </div>
      {/if}
      <Field>
        <FieldLabel>
          Permalink
          <Button slot="action" size="small" mode="ghost" on:click={copyPermalink}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <Text value="permalink" --font-family="var(--font-mono)" --font-size="var(--font-sm)" />
      </Field>
      <Field>
        <FieldLabel>
          WordPress Shortcode
          <Button slot="action" size="small" mode="ghost" on:click={copyShortcode}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <Text value="shortcode" --font-family="var(--font-mono)" --font-size="var(--font-sm)" />
      </Field>
      <Field>
        <FieldLabel>
          Embed HTML iFrame
          <Button slot="action" size="small" mode="ghost" on:click={copyHtml}>
            <Copy16 /> Copy
          </Button>
        </FieldLabel>
        <TextArea value="<iframe />" --font-family="var(--font-mono)" --font-size="var(--font-sm)" --resize="vertical" />
      </Field>
    </div>
  </div>
  <div class="right">
    <header>
      <FieldLabel>
        Embed Preview
        <Button slot="action" size="small" mode="ghost">
          <Sliders16 /> Customize Embed
        </Button>
      </FieldLabel>
    </header>
    <main>
      <iframe title="Embed Preview" src="" />
    </main>
  </div>
</div>

<style>
  .container {
    min-height: 24rem;
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
  }
  .right header {
    padding: .375rem 0;
    /* margin-bottom: .25rem; */
  }
  .right main {
    min-height: 0;
    height: 100%;
  }
  .right iframe {
    height: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }
  .subselection {
    background: var(--white);
    padding: 1rem;
    border-radius: .5rem;
    border: 1px solid var(--gray-2);
    box-shadow: var(--shadow-1);
  }

</style>