<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Infinity16, StarFill16 } from "svelte-octicons";

  import Flex from "$lib/components/common/Flex.svelte";
  import Pin from "$lib/components/icons/Pin.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

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
      href="/add-ons/"
      --hover-background="var(--blue-2)"
    >
      <Infinity16 fill="var(--blue-3)" slot="start" />
      All
    </SidebarItem>
    <SidebarItem
      active={active === "active"}
      href="/add-ons/?active=true"
      --hover-background="var(--orange-2)"
    >
      <Pin --fill="var(--orange-3)" slot="start" />
      Pinned
    </SidebarItem>
    <SidebarItem
      active={active === "featured"}
      href="/add-ons/?featured=true"
      --hover-background="var(--yellow-2)"
    >
      <StarFill16 fill="var(--yellow-3)" slot="start" />
      Featured
    </SidebarItem>
    <SidebarItem
      active={active === "premium"}
      href="/add-ons/?premium=true"
      --hover-background="var(--green-2)"
    >
      <Premium --fill="var(--green-3)" slot="start" />
      Premium
    </SidebarItem>
  </Flex>
  <Flex direction="column">
    <SidebarItem small --color="var(--gray-4)">Collections</SidebarItem>
    {#each CATEGORIES as [key, label]}
      <SidebarItem href={`/add-ons/?category=${key}`} active={active === key}>
        {label}
      </SidebarItem>
    {/each}
  </Flex>
</Flex>
