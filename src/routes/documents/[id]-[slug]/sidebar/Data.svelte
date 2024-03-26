<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { Tag16, Tag24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import KV from "@/lib/components/common/KV.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  export let document: Document;

  $: tags = document.data["_tags"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tags");
  $: empty = Object.keys(document.data).length === 0;
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <Tag16 />
    Data & Tags
  </SidebarItem>

  {#if empty}
    <Empty icon={Tag24}>
      <p>Use tags or key/value data to organize documents</p>
    </Empty>
    <!-- todo: data and tag components -->
  {/if}
</SidebarGroup>
