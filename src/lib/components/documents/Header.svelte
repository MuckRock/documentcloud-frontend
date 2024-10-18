<!--
  @component
  Document top-matter:
  - title
  - description
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";

  import { ALLOWED_TAGS, ALLOWED_ATTR } from "@/config/config.js";
  import { remToPx } from "@/lib/utils/layout";

  export let document: Document;

  let width: number;

  $: BREAKPOINTS = {
    TWO_COLUMN: width > remToPx(48),
  };
  $: description = document.description?.trim()
    ? clean(document.description)
    : "";

  function clean(html: string) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
</script>

<header bind:clientWidth={width} class:twoColumn={BREAKPOINTS.TWO_COLUMN}>
  <h1>{document.title}</h1>
  {#if description}
    <div class="description">
      {@html description}
    </div>
  {/if}
</header>

<style>
  header h1 {
    display: inline;
    overflow-wrap: break-word;
    font-weight: var(--font-semibold);
    font-size: calc(1.25 * var(--font-xl));
    line-height: 1.2;
  }
  header {
    margin: 0 auto;
    max-width: 64rem;
    display: flex;
    flex-direction: column;
    gap: 1rem 0;
  }
  .description {
    line-height: 1.4;
    color: var(--gray-5);
  }
  .twoColumn .description {
    columns: 2;
    column-gap: 1rem;
  }
  :global(.description > *) {
    margin-bottom: 1rem;
  }
</style>
