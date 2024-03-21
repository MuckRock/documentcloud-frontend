<script lang="ts">
  import type { Document } from "$lib/api/types";

  import {
    Apps16,
    Comment16,
    Download16,
    EyeClosed16,
    History16,
    Lock16,
    Share16,
  } from "svelte-octicons";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  export let document: Document;
</script>

<Flex direction="column">
  <SidebarItem>
    <Lock16 />
    <span class="access">{document.access} access</span>
  </SidebarItem>

  <SidebarItem>
    <History16 />
    Revision History
  </SidebarItem>

  <SidebarItem>
    <Download16 />
    Download PDF
  </SidebarItem>
</Flex>

<Flex direction="column">
  <SidebarItem>
    <Share16 />
    Share &hellip;
  </SidebarItem>

  <SidebarItem>
    <Comment16 />
    Add a note &hellip;
  </SidebarItem>

  <SidebarItem>
    <EyeClosed16 />
    Redact &hellip;
  </SidebarItem>

  <SidebarItem>
    <Apps16 />
    Modify Pages &hellip;
  </SidebarItem>
</Flex>

<style>
  .access {
    text-transform: capitalize;
  }
</style>
