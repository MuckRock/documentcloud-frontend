<script lang="ts" context="module">
  import { Globe24, Lock24, Organization24 } from "svelte-octicons";

  export const levels: Level[] = [
    {
      value: "private",
      title: "access.private.title",
      description: "access.private.description",
      icon: Lock24,
    },
    {
      value: "organization",
      title: "access.organization.title",
      description: "access.organization.description",
      icon: Organization24,
    },
    {
      value: "public",
      title: "access.public.title",
      description: "access.public.description",
      icon: Globe24,
    },
  ];

  export function getLevel(access: Access): Level | undefined {
    return levels.find((level) => level.value === access);
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { Access } from "@/lib/api/types";
  import type { Level } from "$lib/components/inputs/AccessLevel.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

  export let level: Level;
</script>

<SidebarItem
  inline
  title={$_(level.description)}
  --color="var(--gray-5)"
  --font-size="inherit"
>
  <svelte:component this={level.icon} height="1em" width="1em" slot="start" />
  {$_(level.title)}
</SidebarItem>
