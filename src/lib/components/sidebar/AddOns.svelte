<script lang="ts">
  import type { AddOn } from "$lib/api/types";

  import { page } from "$app/state";
  import { APP_URL } from "@/config/config";

  import {
    Hourglass24,
    Plug16,
    Search16,
    Star16,
    Pin16,
    Zap16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Empty from "$lib/components/common/Empty.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Pin from "$lib/components/common/Pin.svelte";
  import Error from "../common/Error.svelte";
  import Button from "../common/Button.svelte";
  import SignedIn from "../common/SignedIn.svelte";
  import { getDocumentQuery } from "$lib/state/query.svelte";

  const documentQuery = getDocumentQuery();

  let pinnedAddOns = $derived(page.data.pinnedAddons ?? []);
</script>

<SignedIn>
  <SidebarGroup name="addons">
    {#snippet title()}
      <NavItem>
        {#snippet start()}
          <Plug16 />
        {/snippet}
        {$_("sidebar.addons.title")}
      </NavItem>
    {/snippet}
    {#snippet action()}
      <Button ghost mode="primary" size="small" minW={false} href="/add-ons/">
        <Search16 width={14} height={14} />
        {$_("common.explore")}
      </Button>
    {/snippet}

    <NavItem small href="/add-ons/?featured=true">
      {#snippet start()}
        <Star16 width={14} height={14} />
      {/snippet}
      Featured
    </NavItem>
    <NavItem small href="/add-ons/?premium=true">
      {#snippet start()}
        <Zap16 width={14} height={14} />
      {/snippet}
      Premium
    </NavItem>
    {#await pinnedAddOns}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then { data, error }}
      {#if error}
        <Error>{error.message}</Error>
      {:else}
        {#each data?.results ?? [] as addon}
          <NavItem small href={documentQuery.getAddonLink(addon)}>
            {#snippet start()}
              <Pin size={0.875} active={addon.active} />
            {/snippet}
            {addon.name}
          </NavItem>
        {:else}
          <NavItem small disabled>
            {#snippet start()}
              <Pin16 />
            {/snippet}
            {$_("sidebar.addons.pinned")}
          </NavItem>
        {/each}
      {/if}
    {:catch error}
      <Error>{error}</Error>
    {/await}
  </SidebarGroup>
</SignedIn>
