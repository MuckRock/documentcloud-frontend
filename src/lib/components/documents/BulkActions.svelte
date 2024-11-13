<!-- @component
This is a menu that wraps all logic around bulk actions for documents.
Most actual actions are deferred to their own forms, so this is more of a switchboard.
-->
<script context="module" lang="ts">
  type Action = "share" | "edit" | "data" | "reprocess" | "delete" | "project";
  type ActionDetail = [label: string, icon: ComponentType];
</script>

<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { Document, Maybe, Nullable } from "$lib/api/types";

  import { getContext, type ComponentType } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Alert16,
    FileDirectory16,
    IssueReopened16,
    Pencil16,
    Share16,
    Tag16,
  } from "svelte-octicons";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  // forms
  import ConfirmDelete from "../forms/ConfirmDelete.svelte";
  import EditDataMany from "../forms/EditDataMany.svelte";
  import EditMany from "../forms/EditMany.svelte";
  import Reprocess from "../forms/Reprocess.svelte";
  import Projects from "../forms/Projects.svelte";

  import { getCurrentUser } from "$lib/utils/permissions";
  import Share from "./Share.svelte";

  export let afterClick: Maybe<() => void> = undefined;

  const me = getCurrentUser();
  const selected: Readable<Document[]> = getContext("selected");

  const actions: Record<Action, ActionDetail> = {
    share: [$_("bulk.actions.share"), Share16],
    edit: [$_("bulk.actions.edit"), Pencil16],
    data: [$_("bulk.actions.data"), Tag16],
    project: [$_("bulk.actions.project"), FileDirectory16],
    reprocess: [$_("bulk.actions.reprocess"), IssueReopened16],
    delete: [$_("bulk.actions.delete"), Alert16],
  };

  let visible: Nullable<Action> = null;

  // svelte 5 will let us do type coercion in templates
  $: toShare = $selected[0]!;
  function show(action: string) {
    visible = action as Action;
  }

  function close() {
    visible = null;
  }
</script>

<!-- for now, we can only share individual documents -->
{#each Object.entries(actions) as [action, [label, icon]]}
  <SidebarItem
    hover
    disabled={action === "share"
      ? $selected?.length !== 1
      : !$me || !$selected?.length}
    on:click={() => {
      show(action);
      afterClick?.();
    }}
  >
    <svelte:component this={icon} slot="start" />
    {label}
  </SidebarItem>
{/each}

{#if visible}
  <Portal>
    <Modal on:close={close}>
      <h1 slot="title">{actions[visible][0]}</h1>

      {#if visible === "share"}
        <Share document={toShare} />
      {/if}

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
