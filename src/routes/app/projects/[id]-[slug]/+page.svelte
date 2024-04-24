<script lang="ts">
  import {
    FileDirectory24,
    Hourglass24,
    Pencil16,
    People16,
    Search16,
    Share16,
  } from "svelte-octicons";

  import MainLayout from "@/lib/components/layouts/MainLayout.svelte";
  import ContentLayout from "@/lib/components/layouts/ContentLayout.svelte";
  import Divider from "@/lib/components/common/Divider.svelte";
  import Flex from "@/lib/components/common/Flex.svelte";
  import SidebarItem from "@/lib/components/sidebar/SidebarItem.svelte";
  import Empty from "@/lib/components/common/Empty.svelte";
  import Error from "@/lib/components/common/Error.svelte";
  import { projectSearchUrl } from "@/lib/utils/search";
  import Search from "@/lib/components/inputs/Search.svelte";
  import ResultsList, {
    selected,
    total,
    visible,
  } from "@/lib/components/documents/ResultsList.svelte";
  import PageToolbar from "@/lib/components/common/PageToolbar.svelte";

  export let data;

  $: project = data.project;
  $: documentSearch = data.documents;
  $: query = data.query;

  function selectAll(e) {
    if (e.target.checked) {
      $selected = [...$visible];
    } else {
      $selected = [];
    }
  }
</script>

<MainLayout>
  <svelte:fragment slot="navigation">
    <Flex direction="column">
      <h1>{project.title}</h1>
      <p>{project.description}</p>
    </Flex>
  </svelte:fragment>

  <ContentLayout slot="content">
    <PageToolbar slot="header">
      <Search name="q" {query} slot="center" />
    </PageToolbar>
    {#await documentSearch}
      <Empty icon={Hourglass24}>Loading project documents…</Empty>
    {:then documentSearchResults}
      {#if documentSearchResults.results}
        <ResultsList
          results={documentSearchResults.results}
          next={documentSearchResults.next}
          count={documentSearchResults.count}
          auto
        />
      {:else}
        <Empty icon={FileDirectory24}>This project is empty</Empty>
      {/if}
    {:catch}
      <Error>Error loading project documents</Error>
    {/await}
    <PageToolbar slot="footer">
      <label slot="left" class="select-all">
        <input
          type="checkbox"
          name="select_all"
          checked={$selected.length === $visible.size}
          indeterminate={$selected.length > 0 &&
            $selected.length < $visible.size}
          on:change={selectAll}
        />
        {#if $selected.length > 0}
          {$selected.length.toLocaleString()} selected
        {:else}
          Select all
        {/if}
      </label>

      <svelte:fragment slot="right">
        {#if $visible && $total}
          Showing {$visible.size.toLocaleString()} of {$total.toLocaleString()}
          results
        {/if}
      </svelte:fragment>
    </PageToolbar>
  </ContentLayout>

  <svelte:fragment slot="action">
    <Flex direction="column">
      <SidebarItem href="#edit"><Pencil16 /> Edit</SidebarItem>
      <SidebarItem href="#collaborate"
        ><People16 /> Manage Collaborators</SidebarItem
      >
      <SidebarItem href="#share"><Share16 /> Share & Embed</SidebarItem>
    </Flex>
    <Divider />
    <SidebarItem href={projectSearchUrl(project)}>
      <Search16 /> View in Document Search
    </SidebarItem>
  </svelte:fragment>
</MainLayout>
