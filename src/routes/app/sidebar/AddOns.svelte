<script lang="ts">
  import type { Page } from "@/api/types/common";
  import type { AddOnListItem } from "@/addons/types";

  import { Book16, Hourglass24, Pin24, Plug16 } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Pin from "@/common/Pin.svelte";
  import { getPinnedAddons } from "@/lib/api/addons";

  export let pinnedAddOns: Promise<Page<AddOnListItem>>;
</script>

<SidebarGroup>
  <SidebarItem slot="title"><Plug16 />{$_("sidebar.addons.title")}</SidebarItem>
  <a href="/add-ons/" slot="action">
    <Action icon={Book16}>{$_("common.explore")}</Action>
  </a>
  <Flex direction="column" gap={0}>
    {#await pinnedAddOns}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then addons}
      {#each addons.results as addon}
        <SidebarItem small href={`/add-ons/${addon.repository}/`}>
          <Pin active={addon.active} />
          {addon.name}
        </SidebarItem>
      {:else}
        <Empty icon={Pin24}>{$_("sidebar.addons.pinned")}</Empty>
      {/each}
    {/await}
  </Flex>
</SidebarGroup>
