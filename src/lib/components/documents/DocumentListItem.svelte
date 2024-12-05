<!--
@component
This is a list item showing one document. 
It's deliberately minimal and can be wrapped in other components to add additional functionality.

If we're in an embed, we want to open links to documents in new tabs and hide the access label.
-->
<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import DocAccess, { getLevel } from "../common/Access.svelte";
  import KV from "../common/KV.svelte";
  import { canonicalUrl, userOrgString } from "@/lib/api/documents";

  import Thumbnail from "./Thumbnail.svelte";

  export let document: Document;

  const embed: boolean = getContext("embed");

  $: date = new Date(document.created_at).toDateString();
  $: projects = document.projects?.every((p) => typeof p === "object")
    ? (document.projects as Project[])
    : []; // only show projects if we've loaded them

  $: level = getLevel(document.access);

  function clean(html: string) {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
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
  {#if width >= 400}
    <Thumbnail {document} />
  {/if}

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
    overflow: hidden;
    text-overflow: ellipsis;
    /* white-space: nowrap; */
    max-width: 100%;
    margin: 0;
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
