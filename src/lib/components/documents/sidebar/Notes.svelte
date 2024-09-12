<script lang="ts">
  import type { Document, Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Note16, Note24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import { canonicalUrl } from "$lib/api/documents";
  import { noteUrl } from "$lib/api/notes";

  export let document: Document;

  $: notes = document.notes;
  $: annotate = new URL("?mode=annotating", canonicalUrl(document)).href;
</script>

<SidebarGroup name="notes">
  <SidebarItem slot="title">
    <Note16 />
    {$_("sidebar.toc.notes")}
  </SidebarItem>

  <ol class="notes">
    {#each notes as note}
      <li>
        <SidebarItem href={noteUrl(document, note).href} small>
          <span class="note_title">{note.title}</span>
          <span class="page_number">
            {$_("sidebar.toc.pageAbbrev")}
            {note.page_number + 1}</span
          >
        </SidebarItem>
      </li>
    {:else}
      <Empty>
        <Note24 />
        {#if document.edit_access}
          <p>
            <a href={annotate}> {$_("notes.cta")}</a>
          </p>
        {:else}
          <p>{$_("notes.empty")}</p>
        {/if}
      </Empty>
    {/each}
  </ol>
</SidebarGroup>

<style>
  ol {
    list-style: none;
    padding: 0;
  }

  span.page_number {
    color: var(--gray-4);
    font-size: var(--font-sm);
  }

  .note_title {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
