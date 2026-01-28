<!-- Assumes its a child of ViewerContext -->
<script module lang="ts">
  type Action =
    | "share"
    | "edit"
    | "revisions"
    | "reprocess"
    | "delete"
    | "change_owner";
</script>

<script lang="ts">
  import type { Document, Nullable, Org, User } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    Download16,
    History16,
    IssueReopened16,
    Pencil16,
    Person16,
    Share16,
    Trash16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import ChangeOwner from "$lib/components/forms/ChangeOwner.svelte";
  import ConfirmDelete from "$lib/components/forms/ConfirmDelete.svelte";
  import Edit from "$lib/components/forms/Edit.svelte";
  import Reprocess from "$lib/components/forms/Reprocess.svelte";
  import RevisionControl from "$lib/components/forms/RevisionControl.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import PremiumBadge from "$lib/components/premium-credits/PremiumBadge.svelte";
  import UpgradePrompt from "$lib/components/premium-credits/UpgradePrompt.svelte";

  import Revisions from "$lib/components/documents/Revisions.svelte";
  import Share from "$lib/components/forms/Share.svelte";

  import { getCurrentPage } from "../viewer/ViewerContext.svelte";
  import { getPendingDocuments } from "$lib/components/processing/ProcessContext.svelte";

  import { getUpgradeUrl } from "$lib/api/accounts";
  import { pdfUrl } from "$lib/api/documents";
  import { canChangeOwner } from "$lib/utils/permissions";

  interface Props {
    document: Document;
    user: Nullable<User>;
  }

  let { document, user }: Props = $props();

  const page = getCurrentPage();
  const pending = getPendingDocuments();

  const labels: Record<Action, string> = {
    share: "sidebar.shareEmbed",
    edit: "edit.title",
    revisions: "dialogRevisionsDialog.heading",
    reprocess: "dialogReprocessDialog.title",
    delete: "delete.title",
    change_owner: "bulk.actions.change_owner",
  };

  let visible: Nullable<Action> = $state(null);

  let organization = $derived(
    typeof user?.organization === "object" ? (user.organization as Org) : null,
  );
  let plan = $derived(organization?.plan ?? "Free");
  let processing = $derived(
    $pending?.map((d) => d.doc_id).includes(+document.id),
  );

  function show(action: Action) {
    visible = action;
  }

  function close() {
    visible = null;
  }
</script>

<div class="actions wideGap">
  <div class="actions">
    <Button ghost href={pdfUrl(document).href} download target="_blank">
      <Download16 />
      {$_("sidebar.download")}
    </Button>
    <Button ghost on:click={() => show("share")}>
      <Share16 />
      {$_("sidebar.shareEmbed")}
    </Button>
  </div>
  {#if document.edit_access}
    <div class="actions">
      <Button ghost mode="primary" minW={false} on:click={() => show("edit")}>
        <Pencil16 />
        {$_("sidebar.edit")}
      </Button>
      <Button
        ghost
        mode="premium"
        minW={false}
        on:click={() => show("revisions")}
      >
        <History16 />
        {$_("sidebar.revisions")}
        <Premium />
      </Button>
    </div>
    <div class="actions">
      <Button
        ghost
        mode="danger"
        disabled={document.status === "nofile"}
        on:click={() => show("reprocess")}
      >
        {#if processing}
          <IssueReopened16 class="spin" />
          {$_("sidebar.processing")}
        {:else}
          <IssueReopened16 />
          {$_("sidebar.reprocess")}
        {/if}
      </Button>
      <Button ghost mode="danger" on:click={() => show("delete")}>
        <Trash16 />
        {$_("sidebar.delete")}
      </Button>

      {#if canChangeOwner(user, [document])}
        <Button
          ghost
          mode="danger"
          on:click={() => show("change_owner")}
          disabled={!canChangeOwner(user, [document])}
        >
          <Person16 />
          {$_("bulk.actions.change_owner")}
        </Button>
      {/if}

      {#if processing}
        <Tip>
          <span slot="icon"></span>
          {$_("processing.document")}
        </Tip>
      {/if}
    </div>
  {/if}
</div>

{#if visible}
  <Portal>
    <Modal on:close={close}>
      <h1 slot="title">
        {$_(labels[visible])}
        {#if visible === "revisions"}
          <PremiumBadge />
        {/if}
      </h1>

      {#if visible === "share"}
        <Share {document} page={$page} />
      {/if}

      {#if visible === "edit"}
        <Edit {document} on:close={close} />
      {/if}

      {#if visible === "revisions"}
        <div>
          {#if plan !== "Free"}
            <RevisionControl {document} />
            <hr class="divider" />
            <Revisions {document} />
          {:else}
            <UpgradePrompt
              message={$_("dialogRevisionsDialog.upgrade.message")}
              callToAction={$_("dialogRevisionsDialog.upgrade.adminCta")}
              href={getUpgradeUrl(organization).href}
            />
          {/if}
        </div>
      {/if}

      {#if visible === "reprocess"}
        <Reprocess documents={[document]} on:close={close} />
      {/if}

      {#if visible === "delete"}
        <ConfirmDelete documents={[document]} on:close={close} />
      {/if}

      {#if visible === "change_owner"}
        <ChangeOwner documents={[document]} on:close={close} />
      {/if}
    </Modal>
  </Portal>
{/if}

<style>
  .actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .wideGap {
    gap: 1rem;
  }
</style>
