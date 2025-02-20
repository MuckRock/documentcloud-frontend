<!-- Assumes its a child of ViewerContext -->

<script lang="ts">
  import type { Document, Nullable, Org, User } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    Download16,
    History16,
    IssueReopened16,
    Pencil16,
    Share16,
    Trash16,
    Undo16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
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
  import Share from "$lib/components/documents/Share.svelte";

  import { getUpgradeUrl } from "$lib/api/accounts";
  import { pdfUrl, canonicalUrl } from "$lib/api/documents";
  import { getCurrentPage } from "../viewer/ViewerContext.svelte";
  import { getPendingDocuments } from "$lib/components/processing/ProcessContext.svelte";

  export let document: Document;
  export let user: Nullable<User>;
  export let action: string = "";

  const page = getCurrentPage();
  const pending = getPendingDocuments();

  $: shareOpen = action === "share";
  $: editOpen = action === "edit";
  $: revisionsOpen = action === "revisions";
  $: reprocessOpen = action === "reprocess";
  $: deleteOpen = action === "delete";

  $: organization =
    typeof user?.organization === "object" ? (user.organization as Org) : null;
  $: plan = organization?.plan ?? "Free";
  $: canonical = canonicalUrl(document);
  $: legacy = new URL(
    canonical.pathname,
    "https://legacy.www.documentcloud.org",
  );
  $: processing = $pending?.map((d) => d.doc_id).includes(+document.id);
</script>

<div class="actions wideGap">
  <div class="actions">
    <Button ghost href={pdfUrl(document).href} download target="_blank">
      <Download16 />
      {$_("sidebar.download")}
    </Button>
    <Button ghost on:click={() => (shareOpen = true)}>
      <Share16 />
      {$_("sidebar.shareEmbed")}
    </Button>
    <Button ghost href={legacy.href} minW={false}>
      <Undo16 />
      <span class="legacy">View in Legacy DocumentCloud</span>
    </Button>
  </div>
  {#if document.edit_access}
    <div class="actions">
      <Button
        ghost
        mode="primary"
        minW={false}
        on:click={() => (editOpen = true)}
      >
        <Pencil16 />
        {$_("sidebar.edit")}
      </Button>
      <Button
        ghost
        mode="premium"
        minW={false}
        on:click={() => (revisionsOpen = true)}
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
        on:click={() => (reprocessOpen = true)}
      >
        {#if processing}
          <IssueReopened16 class="spin" />
          {$_("sidebar.processing")}
        {:else}
          <IssueReopened16 />
          {$_("sidebar.reprocess")}
        {/if}
      </Button>
      <Button ghost mode="danger" on:click={() => (deleteOpen = true)}>
        <Trash16 />
        {$_("sidebar.delete")}
      </Button>

      {#if processing}
        <Tip>
          <span slot="icon"></span>
          {$_("processing.document")}
        </Tip>
      {/if}
    </div>
  {/if}
</div>

{#if document.edit_access && editOpen}
  <Portal>
    <Modal on:close={() => (editOpen = false)}>
      <h1 slot="title">{$_("edit.title")}</h1>
      <Edit {document} on:close={() => (editOpen = false)} />
    </Modal>
  </Portal>
{/if}

{#if revisionsOpen}
  <Portal>
    <Modal on:close={() => (revisionsOpen = false)}>
      <h1 slot="title">
        {$_("dialogRevisionsDialog.heading")}
        <PremiumBadge />
      </h1>
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
    </Modal>
  </Portal>
{/if}

{#if shareOpen}
  <Portal>
    <Modal on:close={() => (shareOpen = false)}>
      <h1 slot="title">{$_("sidebar.shareEmbed")}</h1>
      <Share {document} page={$page} />
    </Modal>
  </Portal>
{/if}

{#if reprocessOpen}
  <Portal>
    <Modal on:close={() => (reprocessOpen = false)}>
      <h1 slot="title">{$_("dialogReprocessDialog.title")}</h1>
      <Reprocess
        documents={[document]}
        on:close={() => (reprocessOpen = false)}
      />
    </Modal>
  </Portal>
{/if}

{#if deleteOpen}
  <Portal>
    <Modal on:close={() => (deleteOpen = false)}>
      <h1 slot="title">{$_("delete.title")}</h1>
      <ConfirmDelete
        documents={[document]}
        on:close={() => (deleteOpen = false)}
      />
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
  .legacy {
    text-align: left;
  }
</style>
