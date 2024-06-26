<script lang="ts">
  import type { Document, ViewerMode } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  import EditSections from "$lib/components/forms/EditSections.svelte";

  import { canonicalUrl, pageUrl } from "$lib/api/documents";

  export let document: Document;
  export let mode: ViewerMode = "document";

  $: sections = document.sections;
  $: empty = sections.length === 0;
  $: annotate = new URL("annotate/", canonicalUrl(document)).href;
</script>

<SidebarGroup>
  {#if mode === "annotating"}
    <EditSections {document} />
  {:else}
    <SidebarItem slot="title">
      <ListOrdered16 />
      {$_("sidebar.toc.sections")}
    </SidebarItem>

    <ol>
      {#each sections as section}
        <li>
          <SidebarItem href={pageUrl(document, section.page_number).href}>
            {section.title}

            <span class="page_number">
              {$_("sidebar.toc.pageAbbrev")}
              {section.page_number + 1}</span
            >
          </SidebarItem>
        </li>
      {/each}
    </ol>

    {#if empty}
      <Empty icon={ListOrdered24}>
        {#if document.edit_access}
          <p>
            <a href={annotate}> {$_("sidebar.toc.cta")}</a>
          </p>
        {:else}
          <p>{$_("sidebar.toc.empty")}</p>
        {/if}
      </Empty>
    {/if}
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
