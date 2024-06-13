<script lang="ts">
  import type { Document } from "$lib/api/types";
  import type { ModalContext } from "$lib/components/layouts/Modal.svelte";

  import { getContext } from "svelte";
  import {
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
  import Reprocess from "$lib/components/forms/Reprocess.svelte";

  import { canonicalUrl, pdfUrl } from "$lib/api/documents";

  export let document: Document;

  const modal: ModalContext = getContext("modal");

  // urls
  $: revisions = relative(document, "revisions/");
  $: pdf = pdfUrl(document).toString();
  $: annotate = relative(document, "annotate/");
  $: redact = relative(document, "redact/");
  $: modify = relative(document, "modify/");

  function relative(document: Document, path: string) {
    return new URL(path, canonicalUrl(document)).href;
  }

  function openReprocess() {
    $modal = {
      component: Reprocess,
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
      <Action icon={Pencil16}>{$_("sidebar.edit")}</Action>
    {/if}
  </SidebarItem>

  {#if document.revision_control && document.edit_access}
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
    <SidebarItem href={annotate}>
      <Comment16 />
      {$_("sidebar.annotate")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem href={redact}>
      <EyeClosed16 />
      {$_("sidebar.redact")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem href={modify}>
      <Apps16 />
      {$_("sidebar.modify")} &hellip;
    </SidebarItem>
  {/if}

  {#if document.edit_access}
    <SidebarItem>
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
</Flex>
