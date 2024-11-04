<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";

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
  import Projects from "$lib/components/forms/Projects.svelte";
  import Share from "$lib/components/documents/Share.svelte";

  const selected: Writable<Document[]> = getContext("selected");

  let edit = false;
  let organize = false;
  let share = false;

  $: toShare = $selected?.length === 1 ? $selected[0] : null;
</script>

<Flex direction="column">
  <!-- for now, we can only share individual documents or projects -->
  <SidebarItem hover disabled={!toShare} on:click={(e) => (share = true)}>
    <Share16 slot="start" />{$_("dialog.share")} &hellip;
  </SidebarItem>
  <SidebarItem
    hover
    disabled={$selected?.length < 1}
    on:click={(e) => (edit = true)}
  >
    <Pencil16 slot="start" />{$_("dialog.edit")} &hellip;
  </SidebarItem>
  <SidebarItem
    hover
    disabled={$selected?.length < 1}
    on:click={(e) => (organize = true)}
  >
    <FileDirectory16 slot="start" />{$_("dialog.organize")} &hellip;
  </SidebarItem>
  <SidebarItem hover href="/add-ons/">
    <Plug16 slot="start" />{$_("dialog.run")} &hellip;
  </SidebarItem>
</Flex>

{#if edit}
  <Portal>
    <Modal on:close={() => (edit = false)}>
      <h1 slot="title">{$_("dialog.edit")}</h1>
      <EditMany documents={$selected} on:close={() => (edit = false)}>
        {#if $selected?.length}
          <p>{$_("edit.many", { values: { n: $selected?.length } })}</p>
        {/if}
      </EditMany>
    </Modal>
  </Portal>
{/if}

{#if organize}
  <Portal>
    <Modal on:close={() => (organize = false)}>
      <h1 slot="title">{$_("dialog.organize")}</h1>
      <Projects documents={$selected} on:close={() => (organize = false)} />
    </Modal>
  </Portal>
{/if}

{#if share && toShare}
  <Portal>
    <Modal on:close={() => (share = false)}>
      <h1 slot="title">{$_("dialog.share")}</h1>
      <Share document={toShare} />
    </Modal>
  </Portal>
{/if}
