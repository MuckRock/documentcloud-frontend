<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { getContext, type ComponentType, type SvelteComponent } from "svelte";
  import { writable, type Writable } from "svelte/store";
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

  import { page } from "$app/stores";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import Reprocess from "$lib/components/forms/Reprocess.svelte";

  import { canonicalUrl, pdfUrl } from "$lib/api/documents";

  export let document: Document;

  const modal: Writable<ComponentType<SvelteComponent>> = getContext("modal");

  // urls
  $: edit = relative(document, "edit/");
  $: revisions = relative(document, "revisions/");
  $: pdf = pdfUrl(document).toString();
  $: annotate = relative(document, "annotate/");
  $: redact = relative(document, "redact/");
  $: modify = relative(document, "modify/");

  function relative(document: Document, path: string) {
    return new URL(path, canonicalUrl(document)).href;
  }

  function openReprocess() {
    $modal = Reprocess;
  }
</script>

<Flex direction="column">
  <SidebarItem>
    <Lock16 />
    <span class="access"
      >{$_(`access.${document.access}.title`)} {$_("access.access")}</span
    >

    {#if document.edit_access}
      <Action icon={Pencil16}><a href={edit}>{$_("sidebar.edit")}</a></Action>
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
    <SidebarItem hover>
      <Action on:click={openReprocess}>
        <IssueReopened16 />
        {$_("sidebar.reprocess")}
      </Action>
    </SidebarItem>
  {/if}
</Flex>

<style>
  a {
    color: var(--black);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
