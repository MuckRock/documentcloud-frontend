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

<div class="access {level.value}">
  <svelte:component this={level.icon} height="1em" width="1em" />
  {$_(level.title)}
</div>

<style>
  .access {
    display: flex;
    align-items: center;
    gap: 0.5em;

    font-weight: var(--font-semibold);
    color: var(--color, var(--gray-5));
    fill: var(--fill, var(--gray-4));
  }

  .access.public {
    fill: var(--note-public);
    color: color-mix(in srgb, var(--note-public), var(--gray-5));
  }

  .access.organization {
    fill: var(--note-org);
    color: color-mix(in srgb, var(--note-org), var(--gray-5));
  }

  .access.private {
    fill: var(--note-private);
    color: color-mix(in srgb, var(--note-private), var(--gray-5));
  }
</style>
