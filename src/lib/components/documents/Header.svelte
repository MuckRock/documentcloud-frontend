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
  import Access, { getLevel } from "$lib/components/common/Access.svelte";
  import { remToPx } from "$lib/utils/layout";
  import SignedIn from "../common/SignedIn.svelte";

  export let document: Document;

  let width: number;

  $: BREAKPOINTS = {
    TWO_COLUMN: width > remToPx(48),
  };
  $: description = document.description?.trim()
    ? clean(document.description)
    : "";

  function clean(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }

  $: access = getLevel(document.access);
</script>

<header bind:clientWidth={width}>
  <SignedIn>
    {#if access}
      <div class="access">
        <Access level={access} />
      </div>
    {/if}
  </SignedIn>
  <h1 class="title">{document.title}</h1>
  {#if description}
    <div class="description" class:twoColumn={BREAKPOINTS.TWO_COLUMN}>
      {@html description}
    </div>
  {/if}
</header>

<style>
  header {
    margin: 0 auto;
    max-width: 64rem;
    display: flex;
    flex-flow: row-reverse wrap;
    align-items: baseline;
    /* with row-reverse, align to end instead of start */
    justify-content: flex-end;
    gap: 1rem;
  }
  .title {
    flex: 1 1 32rem;
    display: inline;
    overflow-wrap: break-word;
    font-weight: var(--font-semibold);
    font-size: var(--font-xl);
    line-height: 1.2;
    word-break: break-all;
  }
  .access {
    flex: 0 1 auto;
  }
  .description {
    flex: 1 1 100%;
    line-height: 1.4;
    color: var(--gray-5);
  }
  .twoColumn.description {
    columns: 2;
    column-gap: 1rem;
  }
  :global(.description > *) {
    margin-bottom: 1rem;
  }
</style>
