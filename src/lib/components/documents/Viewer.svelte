<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document, DocumentText, ViewerMode } from "$lib/api/types";
  import { pdfUrl, shouldPaginate } from "$lib/api/documents";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import ContentLayout from "../layouts/ContentLayout.svelte";
  import PDF from "./PDF.svelte";
  import Zoom, { zoomToScale, zoom, zoomToSize } from "./Zoom.svelte";
  import Paginator from "./Paginator.svelte";
  import SelectMode from "./SelectMode.svelte";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import Text from "./Text.svelte";
  import Notes from "./Notes.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import Dropdown from "@/common/Dropdown2.svelte";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";
  import Empty from "../common/Empty.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let mode: ViewerMode;
  export let document: Document;
  export let text: Promise<DocumentText> | DocumentText;
  export let query: string = "";

  $: asset_url = pdfUrl(document);
</script>

<div class="container">
  <ContentLayout>
    <PageToolbar slot="header">
      <SelectMode slot="left" bind:mode />
      <div slot="center" />
      <Search name="q" {query} slot="right" />
    </PageToolbar>
    {#if mode === "document"}
      <PDF {document} scale={zoomToScale($zoom)} {asset_url} {query} />
    {:else if mode === "text"}
      <Text {text} zoom={+$zoom || 1} total={document.page_count} {query} />
    {:else if mode === "grid"}
      <ThumbnailGrid {document} size={zoomToSize($zoom)} />
    {:else if mode === "notes"}
      <Notes {document} {asset_url} />
    {/if}
    <PageToolbar slot="footer">
      <svelte:fragment slot="left">
        {#if mode === "document"}
          <Dropdown id="sections" position="top left" --offset="5px">
            <div class="toolbarItem" slot="title">
              <SidebarItem>
                <ListOrdered16 />
                Sections
                <ChevronUp12 />
              </SidebarItem>
            </div>
            <Menu>
              {#each document.sections as section}
                <MenuItem>{section.title}</MenuItem>
              {:else}
                <Empty icon={ListOrdered24}>
                  {#if document.edit_access}
                    <p>{$_("sidebar.toc.cta")}</p>
                  {:else}
                    <p>{$_("sidebar.toc.empty")}</p>
                  {/if}
                </Empty>
              {/each}
            </Menu>
          </Dropdown>
        {/if}
      </svelte:fragment>~
      <svelte:fragment slot="center">
        {#if shouldPaginate(mode)}
          <Paginator totalPages={document.page_count} />
        {/if}
      </svelte:fragment>

      <Zoom slot="right" {mode} />
    </PageToolbar>
  </ContentLayout>
</div>

<style>
  .container {
    min-height: 100vh;
    background: var(--gray-1);
  }
  .documentLayout {
    display: flex;
  }
  .documentLayout aside {
    flex: 0 1 12rem;
    border-right: 1px solid var(--gray-2);
    padding: 1rem;
  }
  .documentLayout main {
    flex: 1 1 auto;
  }
  .toolbarItem {
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
