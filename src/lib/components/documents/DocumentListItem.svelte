<script lang="ts">
  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";
  import type { Document, Project } from "$lib/api/types";

  import KV from "../common/KV.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import {
    pageImageUrl,
    canonicalUrl,
    userOrgString,
  } from "$lib/api/documents.js";
  import { pageSizesFromSpec } from "@/api/pageSize.js";

  export let document: Document;

  const width = IMAGE_WIDTHS_MAP.get("thumbnail");

  $: sizes = pageSizesFromSpec(document.page_spec);
  $: aspect = sizes[0];
  $: height = width * aspect;
  $: date = new Date(document.created_at).toDateString();
  $: projects = document.projects.every((p) => typeof p === "object")
    ? (document.projects as Project[])
    : []; // only show projects if we've loaded them

  function clean(html: string) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
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
      <img
        src={pageImageUrl(document, 1, "thumbnail").toString()}
        alt="Page 1, {document.title}"
        width="{width}px"
        height="{height}px"
      />
    </a>
  </div>
  <div class="info">
    <h4>{document.title}</h4>
    <p class="meta">
      {$_("document.pageCount", { values: { n: document.page_count } })} -
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
        >{$_("document.open")}</a
      >

      {#each projects as project}
        <KV key="Project" value={project.title} />
      {/each}
    </div>
  </div>
</div>

<style>
  .document-list-item {
    display: flex;
    max-width: 100%;
    padding: 0rem 1.25rem;
    align-items: center;
    gap: 0.625rem;
  }

  .thumbnail {
    border-radius: 0.125rem;
    border: 1px solid #cbcbcb;
    background: #fff;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  }

  .info {
    display: flex;
    padding: 1.25rem 0rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    flex: 1 0 0;
    align-self: stretch;
  }

  h4 {
    color: #000;
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  .meta {
    color: rgba(0, 0, 0, 0.6);
    font-family: "Source Sans Pro";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  .description {
    color: #000;
    font-family: "Source Sans Pro";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100ch;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    align-self: stretch;
  }

  .open {
    overflow: hidden;
    color: var(--primary, #4294f0);
    text-overflow: ellipsis;
    font-family: "Source Sans Pro";
    font-size: 0.75rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }
</style>
