<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { Clock16, Pencil16 } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Metadata from "$lib/components/common/Metadata.svelte";
  import SignedIn from "$lib/components/common/SignedIn.svelte";

  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  import { canonicalUrl, userOrgString } from "$lib/api/documents";

  export let document: Document;

  function dateFormat(date: Date | string) {
    return new Date(date).toLocaleDateString();
  }

  // urls
  $: edit = new URL("edit/", canonicalUrl(document)).toString();
</script>

<!--
  @component
  Document metadata:

  - title
  - description
  - contributor
  - source
  - last modified
  - uploaded
-->
<Flex direction="column" gap={1}>
  <header>
    <h1>
      {document.title}
    </h1>
    <SignedIn>
      <Action icon={Pencil16}><a href={edit}>Edit</a></Action>
    </SignedIn>
  </header>

  {#if document.description}
    <p class="description">
      {document.description}
    </p>
  {/if}
  <Metadata key="Contributed by" value={userOrgString(document)} />
  <Flex>
    <Metadata key="Last updated on" value={dateFormat(document.updated_at)}
      ><Clock16 slot="icon" />
    </Metadata>

    <Metadata key="Created on" value={dateFormat(document.created_at)}
      ><Clock16 slot="icon" />
    </Metadata>
  </Flex>
</Flex>

<style>
  header h1 {
    display: inline;
  }
</style>
