<script lang="ts">
  import { Hash16, Infinity16, StarFill16, Tag16 } from "svelte-octicons";
  import Pin from "@/common/icons/Pin.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import Premium from "@/common/icons/Premium.svelte";
  import { _ } from "svelte-i18n";
  import Flex from "../common/Flex.svelte";
  import { CATEGORIES } from "$lib/api/addons";

  export let active: string = "all";
</script>

<Flex direction="column" gap={1}>
  <header class="header">
    <h2>{$_("addonBrowserDialog.title")}</h2>
    <p>{$_("addonBrowserDialog.subtitle")}</p>
  </header>
  <Flex direction="column">
    <SidebarItem
      active={active === "all"}
      href="/app/add-ons"
      --hover="var(--blue-2)"
    >
      <Infinity16 fill="var(--blue-3)" />
      All
    </SidebarItem>
    <SidebarItem
      active={active === "active"}
      href="/app/add-ons?active=true"
      --hover="var(--orange-light)"
    >
      <Pin --fill="var(--orange)" />
      Pinned
    </SidebarItem>
    <SidebarItem
      active={active === "featured"}
      href="/app/add-ons?featured=true"
      --hover="var(--yellow-light)"
    >
      <StarFill16 fill="var(--yellow)" />
      Featured
    </SidebarItem>
    <SidebarItem
      active={active === "premium"}
      href="/app/add-ons?premium=true"
      --hover="var(--green-light)"
    >
      <Premium --fill="var(--green)" />
      Premium
    </SidebarItem>
  </Flex>
  <Flex direction="column">
    <SidebarItem small --color="var(--gray-4)">Collections</SidebarItem>
    {#each CATEGORIES as [key, label]}
      <SidebarItem href={`/app/add-ons?category=${key}`}>
        <!-- <Hash16 fill="var(--gray-4)" /> -->
        {label}
      </SidebarItem>
    {/each}
  </Flex>
</Flex>
