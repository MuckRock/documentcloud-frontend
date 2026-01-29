<script lang="ts">
  import type { AddOnListItem } from "$lib/api/types";

  // TODO: Switch to $app/state once Storybook properly supports sveltekit_experimental.state
  // Currently using deprecated $app/stores because Storybook 8.6.15 doesn't populate
  // the state.page.data object from sveltekit_experimental.state parameters.
  import { page } from "$app/stores";
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

  interface Props {
    query?: string;
  }

  let { query = "" }: Props = $props();

  let pinnedAddOns = $derived($page.data.pinnedAddons ?? []);

  function getHref(query: string, addon?: AddOnListItem): string {
    let path = "/add-ons/";
    if (addon) {
      path += `${addon.repository}/`;
    }
    let url = new URL(path, APP_URL);
    // We only see the browser on addons that process documents
    if (addon?.parameters.documents) {
      url.searchParams.set("q", query);
    }
    return url.toString();
  }
</script>

<SidebarGroup name="addons">
  {#snippet title()}
    <NavItem>
      <Plug16 slot="start" />
      {$_("sidebar.addons.title")}
    </NavItem>
  {/snippet}
  {#snippet action()}
    <Button
      ghost
      mode="primary"
      size="small"
      minW={false}
      href={getHref(query)}
    >
      <Search16 width={14} height={14} />
      {$_("common.explore")}
    </Button>
  {/snippet}

  <NavItem small href="/add-ons/?featured=true">
    <Star16 width={14} height={14} slot="start" />
    Featured
  </NavItem>
  <NavItem small href="/add-ons/?premium=true">
    <Zap16 width={14} height={14} slot="start" />
    Premium
  </NavItem>
  <SignedIn>
    {#await pinnedAddOns}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then { data, error }}
      {#if error}
        <Error>{error.message}</Error>
      {:else}
        {#each data?.results ?? [] as addon}
          <NavItem small href={getHref(query, addon)}>
            <Pin size={0.875} active={addon.active} slot="start" />
            {addon.name}
          </NavItem>
        {:else}
          <NavItem small disabled>
            <Pin16 slot="start" />
            {$_("sidebar.addons.pinned")}
          </NavItem>
        {/each}
      {/if}
    {:catch error}
      <Error>{error}</Error>
    {/await}
  </SignedIn>
</SidebarGroup>
