<script lang="ts">
  import type { Document } from "$lib/api/types";

  import {
    Apps16,
    Comment16,
    Download16,
    EyeClosed16,
    History16,
    Lock16,
    Pencil16,
    Share16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import { canonicalUrl, pdfUrl } from "$lib/api/documents";

  export let document: Document;

  function relative(document: Document, path: string) {
    return new URL(path, canonicalUrl(document)).toString();
  }

  // urls
  $: edit = relative(document, "edit/");
  $: revisions = relative(document, "revisions/");
  $: pdf = pdfUrl(document).toString();
  $: annotate = relative(document, "annotate/");
  $: redact = relative(document, "redact/");
  $: modify = relative(document, "modify/");
</script>

<Flex direction="column">
  <SidebarItem>
    <Lock16 />
    <span class="access"
      >{$_(`access.${document.access}.title`)} {$_("access.access")}</span
    >

    <SignedIn>
      <Action icon={Pencil16}><a href={edit}>{$_("sidebar.edit")}</a></Action>
    </SignedIn>
  </SidebarItem>

  {#if document.revision_control}
    <SidebarItem href={revisions}>
      <History16 />
      {$_("sidebar.revisions")}
    </SidebarItem>
  {/if}

  <SidebarItem href={pdf} download>
    <Download16 />
    {$_("sidebar.download")}
  </SidebarItem>
</Flex>

<Flex direction="column">
  <SidebarItem>
    <Share16 />
    {$_("sidebar.share")} &hellip;
  </SidebarItem>

  <SidebarItem href={annotate}>
    <Comment16 />
    {$_("sidebar.annotate")} &hellip;
  </SidebarItem>

  <SidebarItem href={redact}>
    <EyeClosed16 />
    {$_("sidebar.redact")} &hellip;
  </SidebarItem>

  <SidebarItem href={modify}>
    <Apps16 />
    {$_("sidebar.modify")} &hellip;
  </SidebarItem>
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
