<script context="module" lang="ts">
  import type { Document, Note, ViewerMode } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import AnnotationPane from "../AnnotationPane.svelte";
  import Page from "../Page.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  export const meta = {
    title: "Components / Viewer / Annotation pane",
    component: AnnotationPane,
    parameters: { layout: "centered" },
  };

  import { pageSizes } from "@/api/pageSize.js";
  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const sizes = pageSizes(document.page_spec);
  const notes = document.notes.reduce((m, note) => {
    if (!m[note.page_number]) {
      m[note.page_number] = [];
    }
    m[note.page_number].push(note);
    return m;
  }, {});
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("annotating");

  setContext("activeNote", activeNote);
  setContext("currentMode", mode);
</script>

<Story name="default">
  <Flex class="pages" direction="column" gap={1}>
    {#each sizes as [width, height], page_number}
      <Page page_number={page_number + 1}>
        <div class="page-container">
          <AnnotationPane
            {document}
            {page_number}
            notes={notes[page_number] || []}
          />
        </div>
      </Page>
    {/each}
  </Flex>
</Story>

<style>
  .page-container {
    margin: 0;
    position: relative;

    background-color: var(--white, white);
    box-shadow: var(--shadow-1);

    width: 88ch;
    aspect-ratio: 2 / 3;
  }
</style>
