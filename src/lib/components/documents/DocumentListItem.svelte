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

  const width = IMAGE_WIDTHS_MAP.get("thumbnail");

  // this can be updated later if we want different icons
  const statusIcons = {
    error: Alert24,
    nofile: File24,
    pending: Hourglass24,
  };

  $: sizes = document.page_spec ? pageSizesFromSpec(document.page_spec) : null;
  $: aspect = sizes ? sizes[0] : 11 / 8.5; // fallback to US letter for now
  $: height = width * aspect;
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
</script>

<a
  href={canonicalUrl(document).href}
  class="document-list-item"
  target={embed ? "_blank" : undefined}
>
  <div class="thumbnail">
    {#if document.status === "success" || document.status === "readable"}
      <img
        src={pageImageUrl(document, 1, "thumbnail").href}
        alt="Page 1, {document.title}"
        width="{width}px"
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
    <h3>{document.title}</h3>
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
    {#if document.description}
      <p class="description">
        {clean(document.description)}
      </p>
    {/if}
    <Flex align="center" gap={0.625} class="actions">
      {#if !embed && level}
        <div style="font-size: var(--font-sm)">
          <DocAccess {level} />
        </div>
      {/if}
      {#each projects as project}
        <KV key="Project" value={project.title} />
      {/each}
    </Flex>
  </div>
</a>

<style>
  .document-list-item {
    flex: 1 0 0;
    display: flex;
    max-width: 100%;
    min-width: 0;
    align-items: center;
    align-self: stretch;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 0.25rem;
    color: inherit;
    text-decoration: none;
    background-color: transparent;
    border: 1px solid transparent;
  }

  .document-list-item:hover,
  .document-list-item:focus {
    background-color: var(--blue-1);
    border-color: var(--blue-2);
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
    gap: 0.25rem;
    flex: 1 0 0;
    align-self: stretch;
    min-width: 0;
  }

  h3 {
    color: var(--gray-5, #233944);
    font-size: var(--font-md, 1rem);
    font-style: normal;
    font-weight: var(--font-semibold, 600);
    line-height: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .meta {
    color: var(--gray-4, #5c717c);
    font-size: 0.75rem;
    font-style: normal;
    font-weight: var(--font-regular, 400);
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
