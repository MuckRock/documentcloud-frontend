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
  <SidebarItem>
    <h1>{document.title}</h1>
  </SidebarItem>

  <SidebarItem>
    {#if document.description}
      <p class="description">
        {document.description}
      </p>
    {/if}
    <SignedIn>
      <Action icon={Pencil16}><a href={edit}>Edit</a></Action>
    </SignedIn>
  </SidebarItem>

  <Flex>
    <Metadata key="Contributed by" value={userOrgString(document)}></Metadata>

    <Metadata key="Last updated on" value={dateFormat(document.updated_at)}
      ><Clock16 slot="icon" />
    </Metadata>

    <Metadata key="Created on" value={dateFormat(document.created_at)}
      ><Clock16 slot="icon" />
    </Metadata>
  </Flex>
</Flex>
