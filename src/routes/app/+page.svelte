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
  } from "svelte-octicons";
  import MainLayout from "$lib/components/MainLayout.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";
  import Action from "$lib/components/common/Action.svelte";
  import Pin from "@/common/Pin.svelte";
  import ResultsList from "@/lib/components/documents/ResultsList.svelte";
  import ContentLayout from "@/lib/components/ContentLayout.svelte";
  import PageToolbar from "@/lib/components/common/PageToolbar.svelte";
  import Search from "@/lib/components/Search.svelte";

  export let data;

  $: searchResults = data.searchResults;
  $: query = data.query;

  // local utils

  function path(url: URL | string) {
    url = new URL(url);

    return url.pathname;
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
      <ResultsList />
    {:then results}
      <ResultsList {results} />
    {/await}
    <PageToolbar slot="footer" />
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
      <Action slot="action" icon={Book16}>Explore</Action>
      <Flex direction="column" gap={0}>
        <SidebarItem small href="/addon/1">
          <Pin active /> Scraper
        </SidebarItem>
        <SidebarItem small href="/addon/2">
          <Pin active /> Regex Extractor
        </SidebarItem>
        <SidebarItem small href="/addon/3">
          <Pin active /> Tabula Spreadsheet Analysis
        </SidebarItem>
        <SidebarItem small href="/addon/4">
          <Pin active /> GPT 3.5 Analysis
        </SidebarItem>
      </Flex>
    </SidebarGroup>
  </svelte:fragment>
</MainLayout>
