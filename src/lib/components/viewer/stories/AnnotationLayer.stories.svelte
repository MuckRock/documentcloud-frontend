<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import AnnotationLayer from "../AnnotationLayer.svelte";
  import Page from "../Page.svelte";
  import Flex from "$lib/components/common/Flex.svelte";

  export const meta = {
    title: "Components / Viewer / Annotation Layer",
    component: AnnotationLayer,
    parameters: { layout: "centered" },
  };

  import { pageSizes } from "@/api/pageSize.js";
  import doc from "@/test/fixtures/documents/document-expanded.json";
  import ViewerContext from "../ViewerContext.svelte";

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

<Story name="Reading">
  <ViewerContext {document}>
    <Flex class="pages" direction="column" gap={1}>
      {#each sizes as [width, height], page_number}
        <Page page_number={page_number + 1}>
          <div class="page-container">
            <AnnotationLayer {page_number} notes={notes[page_number] || []} />
          </div>
        </Page>
      {/each}
    </Flex>
  </ViewerContext>
</Story>

<Story name="Writing">
  <ViewerContext {document} mode="annotating">
    <Flex class="pages" direction="column" gap={1}>
      {#each sizes as [width, height], page_number}
        <Page page_number={page_number + 1}>
          <div class="page-container">
            <AnnotationLayer {page_number} notes={notes[page_number] || []} />
          </div>
        </Page>
      {/each}
    </Flex>
  </ViewerContext>
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
