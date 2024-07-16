<script lang="ts">
  import type { Access, Document, Project } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";
  import { Alert24, Hourglass24, File24 } from "svelte-octicons";

  import KV from "../common/KV.svelte";
  import NoteTab from "./NoteTab.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import {
    pageImageUrl,
    canonicalUrl,
    userOrgString,
  } from "@/lib/api/documents";
  import { pageSizesFromSpec } from "@/api/pageSize.js";

  export let document: Document;

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

<!--
@component
This is a list item showing one document. 
It's deliberately minimal and can be wrapped in other components to add additional functionality.
-->
<div class="document-list-item">
  <div class="thumbnail">
    <a href={canonicalUrl(document).toString()}>
      {#if document.status === "success" || document.status === "readable"}
        <img
          src={pageImageUrl(document, 1, "thumbnail").toString()}
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
    </a>
    {#if document.notes && document.notes.length > 0}
      <p class="notes">
        {$_("documents.noteCount", { values: { n: document.notes.length } })}
      </p>
    {/if}

    {#if tabs.length > 0}
      <div class="tabs">
        {#each tabs as access}
          <NoteTab {access} size="small" />
        {/each}
      </div>
    {/if}
  </div>

  <div class="info">
    <h3>{document.title}</h3>
    <p class="meta">
      {$_("documents.pageCount", { values: { n: document.page_count } })} -
      {#if userOrgString(document)}{userOrgString(document)} -
      {/if}
      {date}
    </p>
    {#if document.description}
      <p class="description">
        {clean(document.description)}
      </p>
    {/if}
    <div class="actions">
      <a href={canonicalUrl(document).toString()} class="open"
        >{$_("documents.open")}</a
      >

      {#each projects as project}
        <KV key="Project" value={project.title} />
      {/each}
    </div>
  </div>
</div>

<style>
  .document-list-item {
    flex: 1 0 0;
    display: flex;
    max-width: 100%;
    min-width: 0;
    align-items: center;
    align-self: stretch;
    gap: 0.5rem;
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

  .thumbnail p {
    color: var(--gray-5);
    font-size: var(--font-xs);
  }

  .thumbnail .tabs {
    position: absolute;
    left: -0.5rem;
    top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .info {
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

  .actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    align-self: stretch;
  }

  .open {
    color: var(--primary, #4294f0);
    font-size: var(--font-xs, 0.75rem);
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
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
    fill: var(--red, #f00);
  }
</style>
