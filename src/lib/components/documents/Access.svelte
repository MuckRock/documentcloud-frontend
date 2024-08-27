<script lang="ts">
  import type { Document } from "@/lib/api/types";
  import { levels } from "$lib/components/inputs/AccessLevel.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let document: Document;

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
