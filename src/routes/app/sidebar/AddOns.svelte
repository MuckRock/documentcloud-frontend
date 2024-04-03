<script lang="ts">
  import type { Page } from "@/api/types/common";
  import type { AddOnListItem } from "@/addons/types";

  import { Book16, Hourglass24, Pin24, Plug16 } from "svelte-octicons";
  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Pin from "@/common/Pin.svelte";
  import { getPinnedAddons } from "@/lib/api/addons";

  let pinnedAddOns = getPinnedAddons();
</script>

<SidebarGroup>
  <SidebarItem slot="title"><Plug16 /> Add-Ons</SidebarItem>
  <a href="/app/add-ons/" slot="action">
    <Action icon={Book16}>Explore</Action>
  </a>
  <Flex direction="column" gap={0}>
    {#await pinnedAddOns}
      <Empty icon={Hourglass24}>Loading…</Empty>
    {:then addons}
      {#each addons.results as addon}
        <SidebarItem small href={`/app/add-ons/${addon.repository}/`}>
          <Pin active={addon.active} />
          {addon.name}
        </SidebarItem>
      {:else}
        <Empty icon={Pin24}>Pinned add-ons will appear here</Empty>
      {/each}
    {/await}
  </Flex>
</SidebarGroup>
