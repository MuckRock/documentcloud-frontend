<script lang="ts">
  import type { Writable } from "svelte/store";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { FileDirectory16, Pencil16, Plug16, Share16 } from "svelte-octicons";

  // layout
  import Flex from "$lib/components/common/Flex.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "@/lib/components/layouts/Portal.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  // forms
  import EditMany from "$lib/components/forms/EditMany.svelte";
  import Share from "$lib/components/documents/Share.svelte";

  import * as documents from "$lib/api/documents";

  const selected: Writable<string[]> = getContext("selected");

  let edit = false;
  let organize = false;
  let share = false;
</script>

<Flex direction="column">
  <!-- for now, we can only share individual documents or projects -->
  <SidebarItem
    hover
    disabled={$selected?.length !== 1}
    on:click={(e) => (share = true)}
  >
    <Share16 />{$_("dialog.share")} &hellip;
  </SidebarItem>
  <SidebarItem hover on:click={(e) => (edit = true)}>
    <Pencil16 />{$_("dialog.edit")} &hellip;
  </SidebarItem>
  <SidebarItem hover on:click={(e) => (organize = true)}>
    <FileDirectory16 />{$_("dialog.organize")} &hellip;
  </SidebarItem>
  <SidebarItem hover href="/add-ons/">
    <Plug16 />{$_("dialog.run")} &hellip;
  </SidebarItem>
</Flex>

{#if edit}
  <Portal>
    <Modal on:close={() => (edit = false)}>
      <h1 slot="title">{$_("dialog.edit")}</h1>
      <EditMany ids={$selected} on:close={() => (edit = false)}>
        {#if $selected.length}
          <p>{$_("edit.many", { values: { n: $selected.length } })}</p>
        {/if}
      </EditMany>
    </Modal>
  </Portal>
{/if}

{#if organize}
  <Portal>
    <Modal on:close={() => (organize = false)}>
      <h1 slot="title">{$_("dialog.organize")}</h1>
    </Modal>
  </Portal>
{/if}

{#if share}
  <Portal>
    <Modal on:close={() => (share = false)}>
      {@const id = $selected[0]}
      <h1 slot="title">{$_("dialog.share")}</h1>
      {#await documents.get(id) then document}
        <Share {document} />
      {/await}
    </Modal>
  </Portal>
{/if}
