<script lang="ts">
  import type { Document } from "$lib/api/types";
  import {
    MODAL,
    type ModalContext,
  } from "$lib/components/layouts/Modal.svelte";

  import { getContext } from "svelte";
  import {
    Alert16,
    Apps16,
    Comment16,
    Download16,
    EyeClosed16,
    History16,
    IssueReopened16,
    Lock16,
    Pencil16,
    Share16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  // modals
  import ConfirmDelete from "$lib/components/forms/ConfirmDelete.svelte";
  import Edit from "$lib/components/forms/Edit.svelte";
  import Reprocess from "$lib/components/forms/Reprocess.svelte";

  import { canonicalUrl, pdfUrl, isProcessing } from "$lib/api/documents";

  export let document: Document;

  const modal: ModalContext = getContext(MODAL);

  // urls
  $: revisions = relative(document, "revisions/");
  $: pdf = pdfUrl(document).toString();
  $: annotate = relative(document, "annotate/");
  $: redact = relative(document, "redact/");
  $: modify = relative(document, "modify/");

  function relative(document: Document, path: string) {
    return new URL(path, canonicalUrl(document)).href;
  }

  function openEdit() {
    if (!modal) return console.warn("modal store is not in context");
    $modal = {
      title: $_("edit.title"),
      component: Edit,
      props: { document },
    };
  }

  function openReprocess() {
    if (!modal) return console.warn("modal store is not in context");
    $modal = {
      title: $_("dialogReprocessDialog.title"),
      component: Reprocess,
      props: { documents: [document] },
    };
  }

  function openDelete() {
    if (!modal) return console.warn("modal store is not in context");

    $modal = {
      title: $_("delete.title"),
      component: ConfirmDelete,
      props: { documents: [document] },
    };
  }
</script>

<Flex direction="column">
  <SidebarItem>
    <Lock16 />
    <span class="access"
      >{$_(`access.${document.access}.title`)} {$_("access.access")}</span
    >

    {#if document.edit_access}
      <Action icon={Pencil16} on:click={openEdit} disabled={!modal}
        >{$_("sidebar.edit")}</Action
      >
    {/if}
  </SidebarItem>

  {#if document.edit_access}
    <SidebarItem href={revisions}>
      <History16 />
      {$_("sidebar.revisions")}
    </SidebarItem>
  {/if}

  <SidebarItem href={pdf} download target="_blank">
    <Download16 />
    {$_("sidebar.download")}
  </SidebarItem>
</Flex>

<Flex direction="column">
  <SidebarItem hover>
    <Share16 />
    {$_("sidebar.share")} &hellip;
  </SidebarItem>

  {#if document.edit_access}
    <SidebarItem href={annotate} disabled={isProcessing(document.status)}>
      <Comment16 />
      {$_("sidebar.annotate")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem href={redact} disabled={isProcessing(document.status)}>
      <EyeClosed16 />
      {$_("sidebar.redact")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem href={modify} disabled={isProcessing(document.status)}>
      <Apps16 />
      {$_("sidebar.modify")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <!-- TODO: Processing component -->
    <SidebarItem disabled={!modal || document.status === "nofile"}>
      {#if document.status !== "success"}
        {$_("status.status")}:
        {$_(`status.${document.status}.title`)}
      {/if}
      <Action on:click={openReprocess}>
        <IssueReopened16 />
        {$_("sidebar.reprocess")}
      </Action>
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem>
      <Action
        on:click={openDelete}
        disabled={!modal}
        --fill="var(--caution)"
        --color="var(--caution)"
      >
        <Alert16 />
        {$_("sidebar.delete")}
      </Action>
    </SidebarItem>
  {/if}
</Flex>
