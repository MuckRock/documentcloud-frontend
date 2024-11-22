<script lang="ts">
  import { APP_URL } from "@/config/config";
  import type { APIResponse } from "@/lib/api/types";
  import type { Page, AddOnListItem } from "$lib/api/types";

  import {
    Book16,
    Hourglass24,
    Pin24,
    Plug16,
    FileCode16,
    Search16,
    Star16,
    Pin16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Empty from "$lib/components/common/Empty.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Pin from "$lib/components/common/Pin.svelte";
  import Error from "../common/Error.svelte";
  import Button from "../common/Button.svelte";

  export let pinnedAddOns: Promise<APIResponse<Page<AddOnListItem>>>;
  export let query: string = "";

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
  <SidebarItem slot="title">
    <Plug16 slot="start" />{$_("sidebar.addons.title")}
  </SidebarItem>
  <Button
    ghost
    mode="primary"
    size="small"
    minW={false}
    href={getHref(query)}
    slot="action"
  >
    <Search16 width={14} height={14} />
    {$_("common.explore")}
  </Button>
  <SidebarItem small href="/add-ons/?featured=true">
    <Star16 width={14} height={14} slot="start" />
    Featured
  </SidebarItem>
  {#await pinnedAddOns}
    <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
  {:then { data, error }}
    {#if error}
      <Error>{error.message}</Error>
    {:else}
      {#each data?.results ?? [] as addon}
        <SidebarItem small href={getHref(query, addon)}>
          <Pin size={0.875} active={addon.active} slot="start" />
          {addon.name}
        </SidebarItem>
      {:else}
        <SidebarItem small disabled>
          <Pin16 slot="start" />
          {$_("sidebar.addons.pinned")}
        </SidebarItem>
      {/each}
    {/if}
  {:catch error}
    <Error>{error}</Error>
  {/await}
</SidebarGroup>
