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
    <span class="access">{document.access} access</span>

    <SignedIn>
      <Action icon={Pencil16}><a href={edit}>Edit</a></Action>
    </SignedIn>
  </SidebarItem>

  <SidebarItem>
    <History16 />
    <a href={revisions}>Revision History</a>
  </SidebarItem>

  <SidebarItem>
    <Download16 />
    <a target="_blank" rel="noopener noreferrer" href={pdf}>Download PDF</a>
  </SidebarItem>
</Flex>

<Flex direction="column">
  <SidebarItem>
    <Share16 />
    Share &hellip;
  </SidebarItem>

  <SidebarItem>
    <Comment16 />
    <a href={annotate}>Add a note &hellip;</a>
  </SidebarItem>

  <SidebarItem>
    <EyeClosed16 />
    <a href={redact}>Redact &hellip;</a>
  </SidebarItem>

  <SidebarItem>
    <Apps16 />
    <a href={modify}>Modify Pages &hellip;</a>
  </SidebarItem>
</Flex>

<style>
  .access {
    text-transform: capitalize;
  }

  a {
    color: var(--black);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
