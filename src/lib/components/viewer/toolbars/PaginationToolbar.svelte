<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, ViewerMode } from "$lib/api/types";

  import { replaceState } from "$app/navigation";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Dropdown from "@/lib/components/common/Dropdown.svelte";
  import EditSections from "$lib/components/forms/EditSections.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import Zoom from "../Zoom.svelte";

  import { pageHashUrl, shouldPaginate } from "$lib/api/documents";
  import { remToPx } from "$lib/utils/layout";
  import { scrollToPage } from "$lib/utils/scroll";
  import { isEmbedded } from "@/lib/utils/viewer";

  export let document: Document;
  export let embed = isEmbedded();

  let sectionsOpen = false;
  let width: number;

  const currentMode: Writable<ViewerMode> = getContext("currentMode");
  const currentPage: Writable<number> = getContext("currentPage");

  $: BREAKPOINTS = {
    TWO_ROWS: width <= remToPx(34),
  };

  $: sections = document.sections ?? [];
  $: totalPages = document.page_count;
  $: showPDF = ["document", "annotating", "redacting"].includes($currentMode);
  $: canEditSections = !embed && document.edit_access;

  // pagination
  function next() {
    $currentPage = Math.min($currentPage + 1, totalPages);
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }

  function previous() {
    $currentPage = Math.max($currentPage - 1, 1);
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }

  function gotoPage(n: number) {
    $currentPage = n;
    scrollToPage($currentPage);
    replaceState(pageHashUrl($currentPage), {});
  }
</script>

<div
  class="toolbar"
  class:twoRows={BREAKPOINTS.TWO_ROWS}
  bind:clientWidth={width}
>
  <div class="sections">
    {#if showPDF && (sections || canEditSections)}
      <Dropdown id="sections" position="top left" --offset="5px">
        <div class="toolbarItem" slot="title">
          <SidebarItem>
            <ListOrdered16 slot="start" />
            Sections
            <ChevronUp12 slot="end" />
          </SidebarItem>
        </div>
        <Menu>
          {#each sections as section}
            <MenuItem on:click={() => gotoPage(section.page_number)}
              >{section.title}</MenuItem
            >
          {:else}
            <Empty icon={ListOrdered24}>
              <p>{$_("sidebar.toc.empty")}</p>
            </Empty>
          {/each}
          {#if canEditSections}
            {#if sections.length === 0}
              <Button
                ghost
                mode="primary"
                on:click={() => (sectionsOpen = true)}
                >{$_("sidebar.toc.cta")}</Button
              >
            {:else}
              <Button
                ghost
                mode="primary"
                on:click={() => (sectionsOpen = true)}
                >{$_("sections.edit")}</Button
              >
            {/if}
          {/if}
        </Menu>
      </Dropdown>
    {/if}
  </div>

  {#if shouldPaginate($currentMode)}
    <div class="paginator">
      <Paginator
        goToNav
        on:goTo={(e) => gotoPage(e.detail)}
        on:next={next}
        on:previous={previous}
        bind:page={$currentPage}
        {totalPages}
        has_next={$currentPage < totalPages}
        has_previous={$currentPage > 1}
      />
    </div>
  {/if}

  <div class="zoom">
    <Zoom mode={$currentMode} />
  </div>
</div>

{#if canEditSections && sectionsOpen}
  <Portal>
    <Modal on:close={() => (sectionsOpen = false)}>
      <h1 slot="title">{$_("sections.edit")}</h1>
      <EditSections {document} on:close={() => (sectionsOpen = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .toolbar {
    width: 100%;
  }
  .paginator {
    flex: 1 1 auto;
  }
  .sections,
  .zoom {
    flex: 1 1 8em;
  }
  .toolbar.twoRows {
    flex-wrap: wrap;
    padding: 0.25rem;
  }
  .toolbar.twoRows .paginator {
    order: -1;
    flex: 1 1 100%;
  }
</style>
