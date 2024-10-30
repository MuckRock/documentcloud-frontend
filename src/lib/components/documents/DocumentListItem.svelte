<!--
@component
This is a list item showing one document. 
It's deliberately minimal and can be wrapped in other components to add additional functionality.

If we're in an embed, we want to open links to documents in new tabs and hide the access label.
-->
<script lang="ts">
  import type { Access, Document, Project } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24, Hourglass24, File24 } from "svelte-octicons";

  import DocAccess, { getLevel } from "../documents/Access.svelte";
  import Flex from "../common/Flex.svelte";
  import KV from "../common/KV.svelte";
  import NoteTab from "../viewer/NoteTab.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import {
    canonicalUrl,
    pageImageUrl,
    userOrgString,
  } from "@/lib/api/documents";
  import { pageSizesFromSpec } from "@/api/pageSize.js";

  export let document: Document;

  const embed: boolean = getContext("embed");

  const thumbnailWidth = IMAGE_WIDTHS_MAP.get("thumbnail");

  // this can be updated later if we want different icons
  const statusIcons = {
    error: Alert24,
    nofile: File24,
    pending: Hourglass24,
  };

  $: sizes = document.page_spec ? pageSizesFromSpec(document.page_spec) : null;
  $: aspect = sizes ? sizes[0] : 11 / 8.5; // fallback to US letter for now
  $: height = thumbnailWidth * aspect;
  $: date = new Date(document.created_at).toDateString();
  $: projects = document.projects?.every((p) => typeof p === "object")
    ? (document.projects as Project[])
    : []; // only show projects if we've loaded them

  $: hasPublicNotes = document.notes?.some((note) => note.access === "public");
  $: hasOrgNotes = document.notes?.some(
    (note) => note.access === "organization",
  );
  $: hasPrivateNotes = document.notes?.some(
    (note) => note.access === "private",
  );
  $: level = getLevel(document.access);

  $: tabs = [
    hasPublicNotes && ("public" as Access),
    hasOrgNotes && ("organization" as Access),
    hasPrivateNotes && ("private" as Access),
  ].filter(Boolean);

  function clean(html: string) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  }

  function onError() {
    document.status = "error";
  }

  let width: number;
</script>

<a
  href={canonicalUrl(document).href}
  class="document-list-item"
  class:small={width < 400}
  target={embed ? "_blank" : undefined}
  bind:clientWidth={width}
>
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
          <NoteTab {access} size="small" />
        {/each}
      </div>
    {/if}
  </div>

  <div class="documentInfo">
    <div class="head">
      <h3 class="title">{document.title}</h3>
      {#if !embed && level}
        <div class="access">
          <DocAccess {level} />
        </div>
      {/if}
    </div>
    <!-- {#if document.description}
      <p class="description">
        {clean(document.description)}
      </p>
    {/if} -->
    <p class="meta">
      {$_("documents.pageCount", { values: { n: document.page_count } })} -
      {#if document.notes && document.notes.length > 0}
        {$_("documents.noteCount", { values: { n: document.notes.length } })} -
      {/if}
      {#if userOrgString(document)}
        {userOrgString(document)} -
      {/if}
      {date}
    </p>
    <div class="data" class:hide={width < 400}>
      {#each projects as project}
        <KV key="Project" value={project.title} />
      {/each}
    </div>
  </div>
</a>

<style>
  .document-list-item {
    flex: 1 0 0;
    display: flex;
    max-width: 100%;
    min-width: 0;
    align-self: stretch;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.25rem;
    color: inherit;
    text-decoration: none;
    background-color: transparent;
    border: 1px solid transparent;
  }

  .document-list-item.small {
    padding: 0.75rem 0.75rem 1.5rem;
  }

  .head {
    width: 100%;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: baseline;
  }

  .small .head {
    flex-direction: column;
    align-items: center;
  }

  .small h3 {
    flex: 1 1 100%;
    order: 1;
    font-size: var(--font-md, 1rem);
  }

  .document-list-item:hover,
  .document-list-item:focus {
    background-color: var(--blue-1);
    border-color: var(--blue-2);
  }

  .small .thumbnail {
    display: none;
  }

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

  .documentInfo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1 0 0;
    align-self: stretch;
    min-width: 0;
  }

  h3 {
    flex: 1 1 auto;
    color: var(--gray-5, #233944);
    font-size: var(--font-md, 1rem);
    font-style: normal;
    font-weight: var(--font-semibold, 600);
    line-height: normal;
    /* overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; */
    max-width: 100%;
  }

  .meta {
    color: var(--gray-4, #5c717c);
    font-size: 0.75rem;
    font-style: normal;
    font-weight: var(--font-semibold, 600);
    line-height: normal;
  }

  .description {
    color: var(--gray-5, #233944);
    font-size: 0.75rem;
    font-style: normal;
    font-weight: var(--font-regular, 400);
    line-height: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100ch;
    width: 100%;
  }

  .access {
    font-size: var(--font-sm);
  }

  .small .access {
    align-self: flex-start;
    flex: 0 1 auto;
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

  .data {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    max-width: 100%;
    overflow-x: auto;
  }

  .hide.data {
    display: none;
  }
</style>
