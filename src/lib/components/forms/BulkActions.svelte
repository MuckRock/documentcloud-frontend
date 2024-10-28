<!-- @component
This is a menu that wraps all logic around bulk actions for documents.
Most actual actions are deferred to their own forms, so this is more of a switchboard.
-->
<script context="module" lang="ts">
  export type Action = "edit" | "data" | "reprocess" | "delete" | "project";
</script>

<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, Nullable } from "$lib/api/types";

  import { getContext, type ComponentType } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Alert16,
    ChevronUp12,
    FileDirectory16,
    IssueReopened16,
    Pencil16,
    Tag16,
  } from "svelte-octicons";

  import Dropdown, {
    type Placement,
  } from "@/lib/components/common/Dropdown.svelte";
  import Menu from "@/lib/components/common/Menu.svelte";
  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  // forms
  import ConfirmDelete from "./ConfirmDelete.svelte";
  import EditDataMany from "./EditDataMany.svelte";
  import EditMany from "./EditMany.svelte";
  import Reprocess from "./Reprocess.svelte";
  import Projects from "./Projects.svelte";

  import { getCurrentUser } from "$lib/utils/permissions";

  export let position: Placement = "top-start";

  const me = getCurrentUser();
  const selected: Writable<Document[]> = getContext("selected");

  const actions: Record<Action, string> = {
    edit: $_("bulk.actions.edit"),
    data: $_("bulk.actions.data"),
    reprocess: $_("bulk.actions.reprocess"),
    delete: $_("bulk.actions.delete"),
    project: $_("bulk.actions.project"),
  };

  const icons: Record<Action, ComponentType> = {
    edit: Pencil16,
    data: Tag16,
    reprocess: IssueReopened16,
    delete: Alert16,
    project: FileDirectory16,
  };

  let visible: Nullable<Action> = null;

  // svelte 5 will let us do type coercion in templates
  function show(action: string) {
    visible = action as Action;
  }

  function close() {
    visible = null;
  }
</script>

<Dropdown {position}>
  <SidebarItem slot="anchor" disabled={!$me || $selected?.length < 1}>
    {$_("bulk.title")}
    <ChevronUp12 slot="end" />
  </SidebarItem>

  <Menu slot="default" let:close>
    {#each Object.entries(actions) as [action, label]}
      <SidebarItem
        hover
        disabled={!$me || $selected?.length < 1}
        on:click={() => {
          close();
          show(action);
        }}
      >
        <svelte:component this={icons[action]} slot="start" />
        {label}
      </SidebarItem>
    {/each}
  </Menu>
</Dropdown>

{#if visible}
  <Portal>
    <Modal on:close={close}>
      <h1 slot="title">{actions[visible]}</h1>
      {#if visible === "edit"}
        <EditMany documents={$selected} on:close={close}>
          {#if $selected?.length}
            <p>{$_("edit.many", { values: { n: $selected?.length } })}</p>
          {/if}
        </EditMany>
      {/if}

      {#if visible === "delete"}
        <ConfirmDelete documents={$selected} on:close={close} />
      {/if}

      {#if visible === "reprocess"}
        <Reprocess documents={$selected} on:close={close} />
      {/if}

      {#if visible === "data"}
        <EditDataMany documents={$selected} on:close={close} />
      {/if}

      {#if visible === "project"}
        <Projects documents={$selected} on:close={close} />
      {/if}
    </Modal>
  </Portal>
{/if}
