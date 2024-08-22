<!-- @component
This is a menu that wraps all logic around bulk actions for documents.
Most actual actions are deferred to their own forms, so this is more of a switchboard.
-->
<script context="module" lang="ts">
  export type Action = "edit" | "data" | "reprocess" | "delete" | "project";
</script>

<script lang="ts">
  import type { Writable } from "svelte/store";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  // forms
  import ConfirmDelete from "./ConfirmDelete.svelte";
  import EditMany from "./EditMany.svelte";
  import Reprocess from "./Reprocess.svelte";

  const selected: Writable<string[]> = getContext("selected");

  const id = "bulk-actions";

  const _actions: [Action, string][] = [
    ["edit", $_("bulk.actions.edit")],
    ["data", $_("bulk.actions.data")],
    ["reprocess", $_("bulk.actions.reprocess")],
    ["delete", $_("bulk.actions.delete")],
    ["project", $_("bulk.actions.project")],
  ];

  const actions: Record<Action, string> = {
    edit: $_("bulk.actions.edit"),
    data: $_("bulk.actions.data"),
    reprocess: $_("bulk.actions.reprocess"),
    delete: $_("bulk.actions.delete"),
    project: $_("bulk.actions.project"),
  };

  let visible: Action = null;

  // svelte 5 will let us do type coercion in templates
  function show(action: string) {
    closeDropdown(id);
    visible = action as Action;
  }

  function close() {
    visible = null;
  }
</script>

<Dropdown {id} position="top right">
  <SidebarItem slot="title" disabled={$selected.length < 1}>
    {$_("bulk.title")}
  </SidebarItem>

  <Menu>
    {#each Object.entries(actions) as [action, label]}
      <SidebarItem
        hover
        disabled={$selected.length < 1}
        on:click={() => show(action)}>{label}</SidebarItem
      >
    {/each}
  </Menu>
</Dropdown>

{#if visible}
  <Portal>
    <Modal on:close={close}>
      <h1 slot="title">{actions[visible]}</h1>
      {#if visible === "edit"}
        <EditMany ids={$selected} on:close={close}>
          {#if $selected.length}
            <p>{$_("edit.many", { values: { n: $selected.length } })}</p>
          {/if}
        </EditMany>
      {/if}

      {#if visible === "delete"}
        <ConfirmDelete ids={$selected} on:close={close} />
      {/if}
    </Modal>
  </Portal>
{/if}
