<!-- @component
This is a menu that wraps all logic around bulk actions for documents.
Most actual actions are deferred to their own forms, so this is more of a switchboard.
-->
<script context="module" lang="ts">
  type Action =
    | "share"
    | "edit"
    | "data"
    | "reprocess"
    | "delete"
    | "project"
    | "change_owner";
</script>

<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { Document, Maybe, Nullable } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Alert16,
    FileDirectory16,
    IssueReopened16,
    Pencil16,
    Person16,
    Share16,
    Tag16,
  } from "svelte-octicons";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  // forms
  import ChangeOwner from "../forms/ChangeOwner.svelte";
  import ConfirmDelete from "../forms/ConfirmDelete.svelte";
  import Edit from "../forms/Edit.svelte";
  import EditDataMany from "../forms/EditDataMany.svelte";
  import EditMany from "../forms/EditMany.svelte";
  import Reprocess from "../forms/Reprocess.svelte";
  import Projects from "../forms/Projects.svelte";

  import Share from "../documents/Share.svelte";
  import Flex from "../common/Flex.svelte";
  import Button from "../common/Button.svelte";

  import { canChangeOwner, getCurrentUser } from "$lib/utils/permissions";

  export let afterClick: Maybe<() => void> = undefined;

  const editable: Readable<boolean> = getContext("editable");
  const selected: Readable<Document[]> = getContext("selected");
  const me = getCurrentUser();

  const labels: Record<Action, string> = {
    share: "bulk.actions.share",
    edit: "bulk.actions.edit",
    data: "bulk.actions.data",
    project: "bulk.actions.project",
    reprocess: "bulk.actions.reprocess",
    delete: "bulk.actions.delete",
    change_owner: "bulk.actions.change_owner",
  };

  let visible: Nullable<Action> = null;

  $: toShare = $selected?.[0]!;

  // svelte 5 will let us do type coercion in templates
  function show(action: string) {
    visible = action as Action;
    if (afterClick) {
      afterClick();
    }

    if (window.plausible) {
      window.plausible("bulk action", {
        props: { action },
      });
    }
  }

  function close() {
    visible = null;
  }

  // typescript needs redundancy sometimes
  function single(selected: Document[]): Document {
    return selected[0] as Document;
  }
</script>

<!-- for now, we can only share individual documents -->
<Flex direction="column" align="start">
  <Button
    ghost
    on:click={() => show("share")}
    disabled={$selected?.length !== 1}
  >
    <Share16 />
    {$_("bulk.actions.share")}
  </Button>

  <Button
    ghost
    mode="primary"
    on:click={() => show("edit")}
    disabled={!$editable}
  >
    <Pencil16 />
    {$_("bulk.actions.edit")}
  </Button>

  <Button
    ghost
    mode="primary"
    on:click={() => show("data")}
    disabled={!$editable}
  >
    <Tag16 />
    {$_("bulk.actions.data")}
  </Button>

  <Button
    ghost
    mode="primary"
    on:click={() => show("project")}
    disabled={$selected?.length < 1}
  >
    <FileDirectory16 />
    {$_("bulk.actions.project")}
  </Button>

  <Button
    ghost
    mode="danger"
    on:click={() => show("reprocess")}
    disabled={!$editable}
  >
    <IssueReopened16 />
    {$_("bulk.actions.reprocess")}
  </Button>

  <hr class="divider" />

  <Button
    ghost
    mode="danger"
    on:click={() => show("delete")}
    disabled={!$editable}
  >
    <Alert16 />
    {$_("bulk.actions.delete")}
  </Button>

  <Button
    ghost
    mode="danger"
    on:click={() => show("change_owner")}
    disabled={!canChangeOwner($me, $selected)}
  >
    <Person16 />
    {$_("bulk.actions.change_owner")}
  </Button>
</Flex>

{#if visible}
  <Portal>
    <Modal on:close={close}>
      <h1 slot="title">{$_(labels[visible])}</h1>

      {#if visible === "share"}
        <Share document={toShare} />
      {/if}

      {#if visible === "edit"}
        {#if $selected.length === 1}
          <Edit document={single($selected)} on:close={close} />
        {:else}
          <EditMany documents={$selected} on:close={close}>
            {#if $selected?.length}
              <p>{$_("edit.many", { values: { n: $selected?.length } })}</p>
            {/if}
          </EditMany>
        {/if}
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

      {#if visible === "change_owner"}
        <ChangeOwner documents={$selected} on:close={close} />
      {/if}
    </Modal>
  </Portal>
{/if}
