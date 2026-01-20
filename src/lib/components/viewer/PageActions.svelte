<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    Share16,
    Comment16,
    ListOrdered16,
    KebabHorizontal16,
  } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import EditNote from "$lib/components/forms/EditNote.svelte";
  import EditSections from "$lib/components/forms/EditSections.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Share from "$lib/components/documents/Share.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getSections } from "$lib/utils/viewer";

  export let document: Document;
  export let page_number: number;
  export let pageWidth: number;

  let pageShareOpen = false;
  let pageNote = false;
  let editSection = false;

  $: section = getSections(document)[page_number];
</script>

<div class="page-actions">
  {#if pageWidth > remToPx(32) || !document.edit_access}
    <Flex align="center">
      <Action icon={Share16} on:click={() => (pageShareOpen = true)}>
        {$_("dialog.share")}
      </Action>
      {#if document.edit_access}
        <div>
          <Action icon={Comment16} on:click={() => (pageNote = true)}>
            {$_("annotate.cta.add-note")}
          </Action>

          <Action icon={ListOrdered16} on:click={() => (editSection = true)}>
            {#if section}
              {$_("annotate.cta.edit-section")}
            {:else}
              {$_("annotate.cta.add-section")}
            {/if}
          </Action>
        </div>
      {/if}
    </Flex>
  {:else}
    <Dropdown position="bottom-end">
      <Button minW={false} slot="anchor" ghost mode="primary">
        <KebabHorizontal16 />
      </Button>
      <Menu slot="inner" let:close>
        <MenuItem
          on:click={() => {
            close();
            pageShareOpen = true;
          }}
        >
          <Share16 slot="icon" />
          {$_("dialog.share")}
        </MenuItem>
        {#if document.edit_access}
          <MenuItem
            on:click={() => {
              close();
              pageNote = true;
            }}
          >
            <Comment16 slot="icon" />
            {$_("annotate.cta.add-note")}
          </MenuItem>

          <MenuItem
            on:click={() => {
              close();
              editSection = true;
            }}
          >
            <ListOrdered16 slot="icon" />
            {#if section}
              {$_("annotate.cta.edit-section")}
            {:else}
              {$_("annotate.cta.add-section")}
            {/if}
          </MenuItem>
        {/if}
      </Menu>
    </Dropdown>
  {/if}
</div>
{#if pageShareOpen}
  <Portal>
    <Modal
      on:close={() => (pageShareOpen = false)}
      fillViewport
      maxWidth="90vw"
      maxHeight="80vh"
    >
      <h1 slot="title">{$_("dialog.share")}</h1>
      <Share {document} page={page_number} currentTab="page" />
    </Modal>
  </Portal>
{/if}
{#if editSection}
  <Portal>
    <Modal on:close={() => (editSection = false)}>
      <h2 slot="title">
        {#if section}
          {$_("annotate.cta.edit-section")}
        {:else}
          {$_("annotate.cta.add-section")}
        {/if}
      </h2>
      <EditSections
        {document}
        on:close={() => (editSection = false)}
        section={section || { page_number: page_number - 1 }}
      />
    </Modal>
  </Portal>
{/if}
{#if pageNote}
  <Portal>
    <Modal on:close={() => (pageNote = false)}>
      <h2 slot="title">
        {$_("annotate.cta.add-note")}
      </h2>
      <EditNote
        {document}
        page_number={page_number - 1}
        on:close={() => (pageNote = false)}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .page-actions {
    flex: 0 0 auto;
  }
</style>
