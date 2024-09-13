<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { ChevronUp12, ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Dropdown from "@/common/Dropdown2.svelte";
  import Empty from "../common/Empty.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import EditSections from "../forms/EditSections.svelte";
  import Portal from "../layouts/Portal.svelte";
  import Modal from "../layouts/Modal.svelte";

  export let document: Document;

  $: sections = document.sections ?? [];

  let formOpen = false;
</script>

<Dropdown id="sections" position="top left" --offset="5px">
  <div class="toolbarItem" slot="title">
    <SidebarItem>
      <ListOrdered16 />
      Sections
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
    {#if document.edit_access}
      {#if sections.length === 0}
        <Button ghost mode="primary" on:click={() => (formOpen = true)}
          >{$_("sidebar.toc.cta")}</Button
        >
      {:else}
        <Button ghost mode="primary" on:click={() => (formOpen = true)}
          >{$_("sections.edit")}</Button
        >
      {/if}
    {/if}
  </Menu>
</Dropdown>
{#if formOpen}
  <Portal>
    <Modal on:close={() => (formOpen = false)}>
      <h1 slot="title">{$_("sections.edit")}</h1>
      <EditSections {document} on:close={() => (formOpen = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .toolbarItem {
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>
