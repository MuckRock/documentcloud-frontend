<script lang="ts">
  import type { Access, Document } from "$lib/api/types";

  import { Alert24, Hourglass24, File24 } from "svelte-octicons";

  import NoteTab from "$lib/components/viewer/NoteTab.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pageImageUrl } from "$lib/api/documents";
  import { pageSizesFromSpec } from "$lib/utils/pageSize";

  export let document: Document;

  const thumbnailWidth = IMAGE_WIDTHS_MAP.get("thumbnail") ?? 60;
  // this can be updated later if we want different icons
  const statusIcons = {
    error: Alert24,
    nofile: File24,
    pending: Hourglass24,
  };

  function onError() {
    document.status = "error";
  }

  $: sizes = document.page_spec ? pageSizesFromSpec(document.page_spec) : null;
  $: aspect = sizes?.[0] ?? 11 / 8.5; // fallback to US letter for now
  $: height = thumbnailWidth * aspect;
  $: hasPublicNotes = document.notes?.some((note) => note.access === "public");
  $: hasOrgNotes = document.notes?.some(
    (note) => note.access === "organization",
  );
  $: hasPrivateNotes = document.notes?.some(
    (note) => note.access === "private",
  );
  $: tabs = [
    hasPublicNotes && ("public" as Access),
    hasOrgNotes && ("organization" as Access),
    hasPrivateNotes && ("private" as Access),
  ].filter(Boolean);
</script>

<div class="thumbnail">
  {#if document.status === "success" || document.status === "readable"}
    <img
      src={pageImageUrl(document, 1, "thumbnail").href}
      alt="Page 1, {document.title}"
      width="{thumbnailWidth}px"
      height="{height}px"
      loading="lazy"
      on:error={onError}
    />
  {:else}
    <div class="fallback {document.status}">
      <svelte:component this={statusIcons[document.status]} />
    </div>
  {/if}

  {#if tabs.length > 0}
    <div class="tabs">
      {#each tabs as access}
        {#if access}
          <NoteTab {access} size="small" />
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .thumbnail {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .thumbnail img,
  .thumbnail .fallback {
    border-radius: 0.125rem;
    border: 1px solid var(--gray-2, #cbcbcb);
    background: var(--white, #fff);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
    /* Constrain tall documents */
    max-height: 4.875rem;
    object-fit: cover;
    object-fit: top center;
  }

  .thumbnail .tabs {
    position: absolute;
    left: -0.5rem;
    top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .fallback {
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: var(--white);
    fill: var(--gray-3);
    /* US letter size, thumbnail width */
    height: calc(60px * 11 / 8.5);
    width: 60px;
  }

  .fallback.error {
    fill: var(--red-3, #f00);
  }
</style>
