<!--
@component
This is a list item showing one document. 
It's deliberately minimal and can be wrapped in other components to add additional functionality.

If we're in an embed, we want to open links to documents in new tabs and hide the access label.
-->
<script lang="ts">
  import type { Document, Project } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import DocAccess, { getLevel } from "../common/Access.svelte";
  import KV from "../common/KV.svelte";
  import Thumbnail from "./Thumbnail.svelte";

  import { canonicalUrl, userOrgString } from "$lib/api/documents";
  import { canonicalUrl as projectUrl } from "$lib/api/projects";
  import { searchUrl, kv } from "$lib/utils/search";
  import {
    defaultVisibleFields,
    type VisibleFields,
  } from "./VisibleFields.svelte";
  import { clean } from "$lib/utils/markup";

  interface Props {
    document: Document;
    visibleFields?: Partial<VisibleFields>;
  }

  let { document, visibleFields = defaultVisibleFields }: Props = $props();

  const embed: boolean = getContext("embed");

  let date = $derived(new Date(document.created_at).toDateString());
  let projects = $derived(
    document.projects?.every((p) => typeof p === "object")
      ? (document.projects as Project[])
      : [],
  ); // only show projects if we've loaded them

  let level = $derived(getLevel(document.access));
  let visible = $derived(
    Object.assign({}, defaultVisibleFields, visibleFields),
  );

  let width: number = $state(800);
</script>

<div
  class="document-list-item"
  class:small={width < 400}
  bind:clientWidth={width}
>
  {#if visible.thumbnail}
    <a
      href={canonicalUrl(document).href}
      class="document-link thumbnail-link"
      target={embed ? "_blank" : undefined}
    >
      <Thumbnail {document} />
    </a>
  {/if}

  <div class="document-info">
    <div class="head">
      <h3 class="title" class:ellipsis={!visible.wrapTitle}>
        <a
          href={canonicalUrl(document).href}
          class="document-link title-link"
          target={embed ? "_blank" : undefined}>{document.title}</a
        >
      </h3>
      {#if !embed && level && visible.access}
        <div class="access">
          <DocAccess {level} />
        </div>
      {/if}
    </div>
    {#if visible.meta}
      <p class="meta">
        <a
          class="document-link"
          href={`${canonicalUrl(document).href}?mode=grid`}
          target={embed ? "_blank" : undefined}
        >
          {$_("documents.pageCount", {
            values: { n: document.page_count },
          })}
        </a>
        -
        {#if document.notes && document.notes.length > 0}
          <a
            class="document-link"
            href={`${canonicalUrl(document).href}?mode=notes`}
            target={embed ? "_blank" : undefined}
          >
            {$_("documents.noteCount", {
              values: { n: document.notes.length },
            })}
          </a> -
        {/if}
        {#if userOrgString(document)}
          {userOrgString(document)} -
        {/if}
        {date}
      </p>
    {/if}
    {#if document.description && visible.description}
      <p class="description">
        {clean(document.description, { allowedTags: [] })}
      </p>
    {/if}
    {#if visible.projects || visible.data}
      <div class="data">
        {#if visible.projects}
          {#each projects as project}
            <KV
              key="Project"
              value={project.title}
              href={projectUrl(project).href}
              title={project.title}
              target={embed ? "_blank" : undefined}
            />
          {/each}
        {/if}
        {#if visible.data}
          {#each Object.entries(document.data) as [key, values]}
            {#each values as value}
              <KV
                {key}
                {value}
                tag={key === "_tag"}
                href={searchUrl(kv(key, value)).href}
                target={embed ? "_blank" : undefined}
              />
            {/each}
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .document-list-item {
    flex: 1 0 0;
    display: flex;
    align-items: flex-start;
    max-width: 100%;
    min-width: 0;
    align-self: stretch;
    gap: 0.5rem 1rem;
    color: var(--gray-5);
  }

  .thumbnail-link {
    position: relative;
  }

  .thumbnail-link:hover::after {
    content: "";
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--blue-3);
    background-blend-mode: multiply;
    opacity: 0.25;
  }

  .document-link {
    color: inherit;
    background-color: transparent;
    text-decoration-color: var(--blue-2);
  }

  .document-link:hover,
  .document-link:focus {
    color: var(--blue-4);
    background-color: var(--blue-1);
    border-color: var(--blue-2);
    box-decoration-break: clone;
  }

  .head {
    flex: 1 1 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
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

  .document-info {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    flex: 1 0 0;
    align-self: center;
    min-width: 0;
  }

  h3 {
    flex: 0 1 auto;
    color: var(--gray-5, #233944);
    font-size: var(--font-md, 1rem);
    font-style: normal;
    font-weight: var(--font-semibold, 600);
    line-height: normal;
    max-width: 100%;
    margin: 0;
  }

  .title {
    overflow-wrap: anywhere;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    flex: 1 1 100%;
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
    display: block;
    display: -webkit-box;
    text-overflow: ellipsis;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-width: 100ch;
    width: 100%;
  }

  /* .fullDescription {
    line-clamp: unset;
    -webkit-line-clamp: unset;
  } */

  .access {
    flex: 0 0 auto;
    font-size: var(--font-sm);
    transform: translateY(0.125em);
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
</style>
