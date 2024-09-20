<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import { replaceState } from "$app/navigation";

  import { pageHashUrl, shouldPaginate } from "$lib/api/documents";
  import type { Document, ViewerMode } from "$lib/api/types";
  import Empty from "$lib/components/common/Empty.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import Dropdown from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Zoom from "$lib/components/documents/Zoom.svelte";
  import EditSections from "$lib/components/forms/EditSections.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import { scrollToPage } from "$lib/utils/scroll";

  export let document: Document;

  let sectionsOpen = false;
  let embed: boolean = getContext("embed") ?? false; // are we embedded?
  const currentMode: Writable<ViewerMode> = getContext("currentMode");
  const currentPage: Writable<number> = getContext("currentPage");

  $: sections = document.sections ?? [];
  $: totalPages = document.page_count;

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

<PageToolbar>
  <svelte:fragment slot="left">
  </svelte:fragment>
  <svelte:fragment slot="center">
    {#if shouldPaginate($currentMode)}
  {#if $currentMode === "document"}
    <div class="sections">
      <Dropdown id="sections" position="top left" --offset="5px">
        <div class="toolbarItem" slot="title">
          <SidebarItem>
            <ListOrdered16 />
            {#if width > BREAKPOINTS.HIDE_LABELS}Sections{/if}
            <ChevronUp12 />
          </SidebarItem>
        </div>
        <Menu>
          {#each sections as section}
            <MenuItem>{section.title}</MenuItem>
          {:else}
            <Empty icon={ListOrdered24}>
              <p>{$_("sidebar.toc.empty")}</p>
            </Empty>
          {/each}
          {#if !embed && document.edit_access}
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
    </div>
  {/if}
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
    {/if}
  </svelte:fragment>
  <Zoom slot="right" mode={$currentMode} />
</PageToolbar>
{#if sectionsOpen}
  <Portal>
    <Modal on:close={() => (sectionsOpen = false)}>
      <h1 slot="title">{$_("sections.edit")}</h1>
      <EditSections {document} on:close={() => (sectionsOpen = false)} />
    </Modal>
  </Portal>
{/if}
