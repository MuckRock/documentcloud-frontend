<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Globe24, Lock24, Organization24 } from "svelte-octicons";

  import type { Document, Access } from "@/lib/api/types";
  import { isOrg } from "@/lib/api/accounts";
  import Avatar from "$lib/components/accounts/Avatar.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Metadata from "$lib/components/common/Metadata.svelte";
  import type { Level } from "$lib/components/inputs/AccessLevel.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";

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
  <svelte:component this={access.icon} slot="start" />
  {access.title}
</SidebarItem>
{#if document.access === "organization" && isOrg(document.organization)}
  <Metadata key={$_("sidebar.sharedWith")}>
    <Flex>
      <Avatar org={document.organization} />
      {document.organization.name}
    </Flex>
  </Metadata>
{/if}
