<script lang="ts">
  import { APP_URL } from "@/config/config";
  import type { Page } from "@/api/types/common";
  import type { AddOnListItem } from "@/addons/types";

  import {
    Book16,
    Hourglass24,
    Pin24,
    Plug16,
    FileCode16,
  } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  import Action from "$lib/components/common/Action.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Pin from "@/common/Pin.svelte";
  import Error from "./Error.svelte";
  import Tooltip from "@/common/Tooltip.svelte";

  export let pinnedAddOns: Promise<Page<AddOnListItem>>;
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
  <SidebarItem slot="title"
    ><Plug16 slot="start" />{$_("sidebar.addons.title")}</SidebarItem
  >
  <a href={getHref(query)} slot="action">
    <Action icon={Book16}>{$_("common.explore")}</Action>
  </a>
  <Flex direction="column" gap={0}>
    {#await pinnedAddOns}
      <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
    {:then addons}
      {#each addons.results as addon}
        <SidebarItem small href={getHref(query, addon)}>
          <Pin active={addon.active} slot="start" />
          {addon.name}
          <svelte:fragment slot="end">
            {#if addon.parameters.documents}
              <Tooltip caption={$_("sidebar.addons.documents")}>
                <FileCode16 />
              </Tooltip>
            {/if}
          </svelte:fragment>
        </SidebarItem>
      {:else}
        <Empty icon={Pin24}>{$_("sidebar.addons.pinned")}</Empty>
      {/each}
    {:catch error}
      <Error>{error}</Error>
    {/await}
    <!-- not using this route, for the moment
      <SidebarItem>
        <a href="/add-ons/runs/">{$_("sidebar.addons.runs")}</a>
      </SidebarItem>
    -->
  </Flex>
</SidebarGroup>
