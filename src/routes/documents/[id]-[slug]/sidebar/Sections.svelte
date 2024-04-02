<script lang="ts">
  import type { Section } from "$lib/api/types";

  import { ListOrdered16, ListOrdered24 } from "svelte-octicons";

  import Empty from "@/lib/components/common/Empty.svelte";
  import SidebarGroup from "@/lib/components/sidebar/SidebarGroup.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";

  export let sections: Section[];
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <ListOrdered16 />
    Sections
  </SidebarItem>

  {#each sections as section}
    <SidebarItem small>
      {section.title}
    </SidebarItem>
  {:else}
    <Empty icon={ListOrdered24}>
      <p>Sections organize your document with a table of contents</p>
    </Empty>
  {/each}
</SidebarGroup>
