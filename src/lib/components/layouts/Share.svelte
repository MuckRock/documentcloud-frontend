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
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: max-content;
    gap: 1rem;
  }

  .banner {
    grid-column: 1/3;
  }

  .fields,
  .preview {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 40vh;
    min-width: 0;
    grid-column: 1/3;
  }

  @media (min-width: 48rem) {
    .container {
      height: auto;
    }

    .fields,
    .preview {
      height: 32rem;
      grid-column: auto;
    }
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

  .preview :global(header) {
    padding: 0.375rem 0;
  }

  .preview :global(main) {
    min-height: 0;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .preview :global(iframe) {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2);
  }
</style>
