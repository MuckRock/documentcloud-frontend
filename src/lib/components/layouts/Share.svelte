<script lang="ts">
  import type { Snippet } from "svelte";

  interface ShareLayoutProps {
    banner?: Snippet;
    fields: Snippet;
    preview: Snippet;
  }

  const { banner, fields, preview }: ShareLayoutProps = $props();
</script>

<div class="container">
  {#if banner}
    <div class="banner">
      {@render banner()}
    </div>
  {/if}
  <div class="fields">
    {@render fields()}
  </div>
  <div class="preview">
    {@render preview()}
  </div>
</div>

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

  .fields,
  .preview {
    display: flex;
    flex-direction: column;
    flex: 1 1 12rem;
    grid-row: 2/3;
    min-width: 0;
  }

  .fields :global(fieldset) {
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
    min-width: auto;
    margin: 0;
  }

  .preview {
    flex: 2 1 24rem;
  }

  .preview :global(header) {
    padding: 0.375rem 0;
  }

  .preview :global(main) {
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .preview :global(iframe) {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }
</style>
