<script context="module" lang="ts">
  import type { Document, Note, ViewerMode } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import NotesPane from "../NotesPane.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  export const meta = {
    title: "Components / Documents / Notes pane",
    component: NotesPane,
    parameters: { layout: "centered" },
  };

  import pdfFile from "$lib/api/fixtures/documents/examples/agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government.pdf";

  import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url,
  ).href;
  import { pageSizes } from "@/api/pageSize.js";
  import doc from "$lib/api/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const sizes = pageSizes(document.page_spec);
  const notes = document.notes.reduce((m, note) => {
    if (!m[note.page_number]) {
      m[note.page_number] = [];
    }
    m[note.page_number].push(note);
    return m;
  }, {});

  const url = new URL(pdfFile, import.meta.url);

  async function load(url: URL) {
    return pdfjs.getDocument(url).promise;
  }
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const activeNote: Writable<Note> = writable(null);
  const mode: Writable<ViewerMode> = writable("annotating");

  setContext("activeNote", activeNote);
  setContext("mode", mode);
</script>

<Story name="default">
  <Flex class="pages" direction="column" gap={1}>
    {#await load(url) then pdf}
      {#each sizes as [width, height], page_number}
        <div class="page">
          <NotesPane {pdf} notes={notes[page_number] || []} scale={1.25} />
        </div>
      {/each}
    {/await}
  </Flex>
</Story>

<style>
  .page {
    position: relative;
    width: 88ch;
    aspect-ratio: 2 / 3;
    box-shadow: var(--shadow);
  }
</style>
