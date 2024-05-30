<script lang="ts">
  import type { Document, Note, Section } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import { pageUrl } from "$lib/api/documents";
  import { noteUrl } from "$lib/api/notes";

  export let document: Document;
  export let notes: Note[] = [];
  export let sections: Section[] = [];

  $: toc = group(sections, notes);
  $: empty = notes.length + sections.length === 0;

  function group(sections: Section[], notes: Note[]) {
    let ungrouped: Note[] = [...notes];

    const grouped = sections
      .reverse()
      .map((section) => {
        const group = {
          section,
          notes: notes.filter((n) => n.page_number >= section.page_number),
        };

        ungrouped = ungrouped.filter(
          (n) => n.page_number < section.page_number,
        );

        return group;
      })
      .reverse();

    return { ungrouped, grouped };
  }
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <ListOrdered16 />
    {$_("sidebar.toc.title")}
  </SidebarItem>

  <ol>
    {#each toc.ungrouped as note}
      <li>
        <SidebarItem href={noteUrl(document, note).href} small>
          {note.title}
          <span class="page_number">
            {$_("sidebar.toc.pageAbbrev")}
            {note.page_number + 1}</span
          >
        </SidebarItem>
      </li>
    {/each}
  </ol>

  <ol>
    {#each toc.grouped as { section, notes }}
      <li>
        <SidebarItem href={pageUrl(document, section.page_number).href}>
          {section.title}
        </SidebarItem>
        <ol class="notes">
          {#each notes as note}
            <SidebarItem small>{note.title}</SidebarItem>
          {/each}
        </ol>
      </li>
    {/each}
  </ol>

  {#if empty}
    <Empty icon={ListOrdered24}>
      <p>{$_("sidebar.toc.empty")}</p>
    </Empty>
  {/if}
</SidebarGroup>

<style>
  ol {
    list-style: none;
    padding: 0;
  }
  span.page_number {
    color: var(--gray-4);
    font-size: var(--font-s);
  }
</style>
