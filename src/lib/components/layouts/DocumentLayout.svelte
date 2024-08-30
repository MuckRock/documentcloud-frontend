<script lang="ts">
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";
  import Flex from "../common/Flex.svelte";
  import Access from "../documents/Access.svelte";
  import Actions from "../documents/Actions.svelte";
  import DocumentHeader from "../documents/Header.svelte";
  import Metadata from "../documents/Metadata.svelte";
  import Viewer from "../documents/Viewer.svelte";

  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";
</script>

<div class="container">
  <header>
    <DocumentHeader {document} />
  </header>
  <main>
    <Viewer {document} {text} {query} />
  </main>
  <aside>
    <div class="sticky top column">
      <Access {document} />
      <Actions {document} />
    </div>
    <div class="sticky bottom">
      <Metadata {document} />
    </div>
  </aside>
</div>

<style>
  .container {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-columns: minmax(42rem, 84rem) 16rem;
    justify-content: center;
    min-height: 100%;
    padding: 0 0.5rem;
    position: relative;
    background: var(--white);
  }

  header {
    z-index: 1;
    grid-column: 1/2;
    grid-row: 1/2;
    padding: 1rem 1.5rem;
  }

  main {
    z-index: 0;
    grid-column: 1/2;
    grid-row: 2/3;

    margin-bottom: 0.5rem;
    background: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: 1rem;
    box-shadow: inset var(--shadow-2);
  }

  aside {
    z-index: 1;
    grid-column: 2/3;
    grid-row: 1/3;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 1rem 1.5rem;
  }

  .sticky {
    position: sticky;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sticky.top {
    top: 1rem;
  }

  .sticky.bottom {
    bottom: 2rem;
  }
</style>
