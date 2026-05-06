<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Infinity16, StarFill16 } from "svelte-octicons";

  import Flex from "$lib/components/common/Flex.svelte";
  import Pin from "$lib/components/icons/Pin.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  import { CATEGORIES } from "$lib/api/addons";

  interface Props {
    active?: string;
  }

  let { active = "all" }: Props = $props();
</script>

<Flex direction="column" gap={1}>
  <header class="header">
    <h2>{$_("addonBrowserDialog.title")}</h2>
    <p>{$_("addonBrowserDialog.subtitle")}</p>
  </header>
  <Flex direction="column">
    <NavItem
      active={active === "all"}
      href="/add-ons/"
      --hover-background="var(--blue-2)"
    >
      {#snippet start()}
        <Infinity16 fill="var(--blue-3)" />
      {/snippet}
      All
    </NavItem>
    <NavItem
      active={active === "active"}
      href="/add-ons/?active=true"
      --hover-background="var(--orange-2)"
    >
      {#snippet start()}
        <Pin --fill="var(--orange-3)" />
      {/snippet}
      Pinned
    </NavItem>
    <NavItem
      active={active === "featured"}
      href="/add-ons/?featured=true"
      --hover-background="var(--yellow-2)"
    >
      {#snippet start()}
        <StarFill16 fill="var(--yellow-3)" />
      {/snippet}
      Featured
    </NavItem>
    <NavItem
      active={active === "premium"}
      href="/add-ons/?premium=true"
      --hover-background="var(--green-2)"
    >
      {#snippet start()}
        <Premium --fill="var(--green-3)" />
      {/snippet}
      Premium
    </NavItem>
  </Flex>
  <Flex direction="column">
    <NavItem small --color="var(--gray-4)">Collections</NavItem>
    {#each CATEGORIES as [key, label]}
      <NavItem href={`/add-ons/?category=${key}`} active={active === key}>
        {label}
      </NavItem>
    {/each}
  </Flex>
</Flex>
