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
  import Share from "$lib/components/forms/Share.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getSections } from "$lib/utils/viewer";

  export let document: Document;
  export let page_number: number;
  export let pageWidth: number;

  let pageShareOpen = false;
  let pageNote = false;
  let editSection = false;

  // `page_number` is 1-indexed here; sections are keyed by 0-indexed page.
  $: section = getSections(document)[page_number - 1];
</script>

<div class="page-actions">
  {#if pageWidth > remToPx(32) || !document.edit_access}
    <Flex align="center">
      <Action icon={Share16} onclick={() => (pageShareOpen = true)}>
        {$_("dialog.share")}
      </Action>
      {#if document.edit_access}
        <div>
          <Action icon={Comment16} onclick={() => (pageNote = true)}>
            {$_("annotate.cta.add-note")}
          </Action>

          <Action icon={ListOrdered16} onclick={() => (editSection = true)}>
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
      {#snippet anchor()}
        <Button minW={false} ghost mode="primary">
          <KebabHorizontal16 />
        </Button>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem
            onclick={() => {
              close();
              pageShareOpen = true;
            }}
          >
            {#snippet icon()}<Share16 />{/snippet}
            {$_("dialog.share")}
          </MenuItem>
          {#if document.edit_access}
            <MenuItem
              onclick={() => {
                close();
                pageNote = true;
              }}
            >
              {#snippet icon()}<Comment16 />{/snippet}
              {$_("annotate.cta.add-note")}
            </MenuItem>

            <MenuItem
              onclick={() => {
                close();
                editSection = true;
              }}
            >
              {#snippet icon()}<ListOrdered16 />{/snippet}
              {#if section}
                {$_("annotate.cta.edit-section")}
              {:else}
                {$_("annotate.cta.add-section")}
              {/if}
            </MenuItem>
          {/if}
        </Menu>
      {/snippet}
    </Dropdown>
  {/if}
</div>
{#if pageShareOpen}
  <Portal>
    <Modal onclose={() => (pageShareOpen = false)}>
      {#snippet title()}
        <h1>{$_("dialog.share")}</h1>
      {/snippet}
      <Share {document} page={page_number} currentTab="page" />
    </Modal>
  </Portal>
{/if}
{#if editSection}
  <Portal>
    <Modal onclose={() => (editSection = false)}>
      {#snippet title()}
        <h2>
          {#if section}
            {$_("annotate.cta.edit-section")}
          {:else}
            {$_("annotate.cta.add-section")}
          {/if}
        </h2>
      {/snippet}
      <EditSections
        {document}
        onclose={() => (editSection = false)}
        section={section || { page_number: page_number - 1 }}
      />
    </Modal>
  </Portal>
{/if}
{#if pageNote}
  <Portal>
    <Modal onclose={() => (pageNote = false)}>
      {#snippet title()}
        <h2>
          {$_("annotate.cta.add-note")}
        </h2>
      {/snippet}
      <EditNote
        {document}
        page_number={page_number - 1}
        onclose={() => (pageNote = false)}
      />
    </Modal>
  </Portal>
{/if}

<style>
  .page-actions {
    flex: 0 0 auto;
  }
</style>
