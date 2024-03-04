<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    Globe16,
    Infinity16,
    Lock16,
    Organization16,
    FileDirectory16,
    Pencil16,
    Plug16,
    PlusCircle16,
    Share16,
    Book16,
    Hourglass24,
    Pin24,
  } from "svelte-octicons";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Action from "$lib/components/common/Action.svelte";
  import Pin from "@/common/Pin.svelte";
  import ResultsList from "$lib/components/documents/ResultsList.svelte";
  import ContentLayout from "$lib/components/ContentLayout.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Search from "$lib/components/Search.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import type { DocumentResults } from "@/lib/api/types";
  import type { AddOnListItem } from "@/addons/types";
  import type { Page } from "@/api/types/common";

  export let data: {
    query: string;
    searchResults: Promise<DocumentResults>;
    pinnedAddons: Promise<Page<AddOnListItem>>;
  };

  let page = 1;
  let per_page = 25;
  let error: Error;

  $: searchResults = data.searchResults;
  $: query = data.query;

  async function load(url) {
    const res = await fetch(url, { credentials: "include" }).catch((e) => {
      error = e;
      throw e; // if something went wrong here, something broke
    });

    if (!res.ok) {
      // 404 or something similar
      console.error(res.statusText);
      error = { name: "Loading error", message: res.statusText };
    }

    data.searchResults = res.json();
  }
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Flex direction="column">
      <SidebarItem hover
        ><Infinity16 /> {$_("projects.allDocuments")}</SidebarItem
      >
      <SidebarItem hover
        ><Globe16 /> {$_("projects.yourPubDocuments")}</SidebarItem
      >
      <SidebarItem hover><Lock16 /> {$_("projects.yourDocuments")}</SidebarItem>
      <SidebarItem hover>
        <Organization16 />
        {$_("projects.orgDocuments", {
          values: { name: "MuckRock" },
        })}
      </SidebarItem>
    </Flex>

    <SidebarGroup>
      <SidebarItem slot="title"><FileDirectory16 /> Projects</SidebarItem>
      <Action slot="action" icon={Book16}>Explore</Action>
      <Flex direction="column" gap={0}>
        <SidebarItem small href="/project/1">
          <Pin active /> Oldest Computer
        </SidebarItem>
        <SidebarItem small href="/project/2">
          <Pin active /> FBI Files
        </SidebarItem>
        <SidebarItem small href="/project/3">
          <Pin active /> 1033 Project
        </SidebarItem>
      </Flex>
    </SidebarGroup>
  </svelte:fragment>

  <ContentLayout slot="content">
    <PageToolbar slot="header">
      <Search {query} slot="center" />
    </PageToolbar>
    {#await searchResults}
      <Empty icon={Hourglass24}>Loading…</Empty>
    {:then results}
      <ResultsList {results} />
    {/await}

    <PageToolbar slot="footer">
      <label slot="left">
        <input type="checkbox" name="select_all" />
        Select all
      </label>

      <svelte:fragment slot="center">
        {#await searchResults then sr}
          {@const count = sr.count}
          {@const total_pages = Math.ceil(count / per_page)}
          {@const next = sr.next}
          {@const previous = sr.previous}
          <Paginator
            {page}
            totalPages={total_pages}
            has_next={Boolean(next)}
            has_previous={Boolean(previous)}
            on:next={(e) => {
              page = Math.min(total_pages, page + 1);
              load(next);
            }}
            on:previous={(e) => {
              page = Math.max(1, page - 1);
              load(previous);
            }}
          />
        {/await}
      </svelte:fragment>

      <label slot="right">
        Per page
        <select name="per_page" bind:value={per_page}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
    </PageToolbar>
  </ContentLayout>

  <svelte:fragment slot="action">
    <Button mode="primary"><PlusCircle16 /> Upload Documents</Button>

    <Flex direction="column">
      <SidebarItem hover disabled><Share16 /> Share…</SidebarItem>
      <SidebarItem hover disabled><Pencil16 /> Edit…</SidebarItem>
      <SidebarItem hover disabled><FileDirectory16 /> Organize…</SidebarItem>
      <SidebarItem hover disabled><Plug16 /> Run…</SidebarItem>
    </Flex>

    <SidebarGroup>
      <SidebarItem slot="title"><Plug16 /> Add-Ons</SidebarItem>
      <a href="/app/add-ons/" slot="action">
        <Action icon={Book16}>Explore</Action>
      </a>
      <Flex direction="column" gap={0}>
        {#await data.pinnedAddons}
          <Empty icon={Hourglass24}>Loading…</Empty>
        {:then addons}
          {#each addons.results as addon}
            <SidebarItem small href={`/app/add-ons/${addon.repository}/`}>
              <Pin active={addon.active} />
              {addon.name}
            </SidebarItem>
          {:else}
            <Empty icon={Pin24}>Pinned add-ons will appear here</Empty>
          {/each}
        {/await}
      </Flex>
    </SidebarGroup>
  </svelte:fragment>
</MainLayout>
