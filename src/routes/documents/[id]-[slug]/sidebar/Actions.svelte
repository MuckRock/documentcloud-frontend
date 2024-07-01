<script lang="ts">
  import type { Document } from "$lib/api/types";
  import Portal from "@/lib/components/layouts/Portal.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";

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

  // urls
  $: revisions = relative(document, "revisions/");
  $: pdf = pdfUrl(document).toString();
  $: annotate = relative(document, "annotate/");
  $: redact = relative(document, "redact/");
  $: modify = relative(document, "modify/");

  function relative(document: Document, path: string) {
    return new URL(path, canonicalUrl(document)).href;
  }

  let editOpen = false;
  let reprocessOpen = false;
  let deleteOpen = false;
</script>

<Flex direction="column">
  {#if document.edit_access}
  <Flex direction="column">
    {#if document.status !== "success"}
    <Flex align="baseline">
      <p class="definition">{$_("status.status")}</p>
      <p class="label">{$_(`status.${document.status}.title`)}</p>
    </Flex>
    {/if}
    <Flex>
      <!-- TODO: Processing component -->
      <Action on:click={() => reprocessOpen = true} disabled={document.status === "nofile"}>
        <IssueReopened16 />
        {$_("sidebar.reprocess")}
      </Action>
      {#if reprocessOpen}
      <Portal>
        <Modal on:close={() => reprocessOpen = false}>
          <h1 slot="title">{$_("dialogReprocessDialog.title")}</h1>
          <Reprocess documents={[document]} on:close={() => reprocessOpen = false} />
        </Modal>
      </Portal>
      {/if}
      <Action
        on:click={() => deleteOpen = true}
        --fill="var(--orange-3)"
        --color="var(--orange-3)"
      >
        <Alert16 />
        {$_("sidebar.delete")}
      </Action>
      {#if deleteOpen}
      <Portal>
        <Modal on:close={() => deleteOpen = false}>
          <h1 slot="title">{$_("delete.title")}</h1>
          <ConfirmDelete documents={[document]} on:close={() => deleteOpen = false} />
        </Modal>
      </Portal>
      {/if}
    </Flex>
  </Flex>
  {/if}
  <SidebarItem>
    <Lock16 />
    <span class="access"
      >{$_(`access.${document.access}.title`)} {$_("access.access")}</span
    >

    {#if document.edit_access}
      <Action icon={Pencil16} on:click={() => editOpen = true}>
        {$_("sidebar.edit")}
      </Action>
    {/if}
  </SidebarItem>
  {#if editOpen}
    <Portal>
      <Modal on:close={() => editOpen = false}>
        <h1 slot="title">{$_("edit.title")}</h1>
        <Edit {document} on:close={() => editOpen = false} />
      </Modal>
    </Portal>
  {/if}

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
</Flex>
