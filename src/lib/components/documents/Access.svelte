<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document, Access } from "@/lib/api/types";
  import type { Level } from "$lib/components/inputs/AccessLevel.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { Globe24, Lock24, Organization24 } from "svelte-octicons";

  export let document: Document;

  export const levels: Level[] = [
    {
      value: $_("access.private.value") as Access,
      title: $_("access.private.title"),
      description: $_("access.private.description"),
      icon: Lock24,
    },
    {
      value: $_("access.organization.value") as Access,
      title: $_("access.organization.title"),
      description: $_("access.organization.description"),
      icon: Organization24,
    },
    {
      value: $_("access.public.value") as Access,
      title: $_("access.public.title"),
      description: $_("access.public.description"),
      icon: Globe24,
    },
  ];

  $: access = levels.find((level) => level.value === document.access);
</script>

<SidebarItem
  inline
  title={access.description}
  --color="var(--gray-5)"
  --font-size="var(--font-lg)"
>
  <svelte:component this={access.icon} />
  {access.title}
</SidebarItem>
