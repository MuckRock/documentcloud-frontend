<script lang="ts">
  import type { Project } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import {
    FileDirectory24,
    Hourglass24,
    SidebarExpand16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/toolbars/PageToolbar.svelte";
  import EditProject from "$lib/components/forms/EditProject.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Modal from "$lib/components/layouts/Modal.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import SidebarLayout from "$lib/components/layouts/SidebarLayout.svelte";
  import ProjectListItem from "$lib/components/projects/ProjectListItem.svelte";
  import Documents from "$lib/components/sidebar/Documents.svelte";
  import Projects from "$lib/components/sidebar/Projects.svelte";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import InfiniteScrollTrigger from "$lib/components/layouts/InfiniteScrollTrigger.svelte";
  import { sidebars } from "$lib/components/layouts/Sidebar.svelte";

  import { SearchResultsState } from "$lib/state/search.svelte.js";
  import { getCurrentUser } from "$lib/utils/permissions";

  let me = $derived(getCurrentUser());

  let { data } = $props();

  let create = $state(false);

  let query = $derived(data.query);

  const search = new SearchResultsState<Project>({ loading: true });

  $effect(() => {
    search.setResults(data.projects);
  });
</script>

<svelte:head>
  <title>{$_("projects.header")} | DocumentCloud</title>
</svelte:head>

<SidebarLayout>
  {#snippet navigation()}
    <Documents />
    <Projects />
    <AddOns />
  {/snippet}

  {#snippet content()}
    <ContentLayout>
      {#snippet header()}
        <Flex>
          {#if $sidebars["navigation"] === false}
            <div class="toolbar w-auto">
              <Button
                ghost
                minW={false}
                onclick={() => ($sidebars["navigation"] = true)}
              >
                <span class="flipV">
                  <SidebarExpand16 />
                </span>
              </Button>
            </div>
          {/if}
          <PageToolbar>
            {#snippet center()}
              <Search
                name="query"
                placeholder={$_("projects.placeholder.projects")}
                {query}
              />
            {/snippet}
          </PageToolbar>
          {#if $sidebars["action"] === false}
            <div class="toolbar w-auto">
              <Button
                ghost
                minW={false}
                onclick={() => ($sidebars["action"] = true)}
              >
                <SidebarExpand16 />
              </Button>
            </div>
          {/if}
        </Flex>
      {/snippet}

      {#each search.results as project}
        <ProjectListItem {project} />
      {:else}
        {#if search.loading}
          <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
        {:else}
          <Empty icon={FileDirectory24}>{$_("projects.none")}</Empty>
        {/if}
      {/each}

      <InfiniteScrollTrigger {search} />

      {#snippet footer()}
        <PageToolbar>
          {#snippet right()}
            {#if search.visible && search.total}
              <p class="resultsCount">
                {$_("inputs.resultsCount", {
                  values: { n: search.visible.size, total: search.total },
                })}
              </p>
            {/if}
          {/snippet}
        </PageToolbar>
      {/snippet}
    </ContentLayout>
  {/snippet}

  {#snippet action()}
    {#if me}
      <Button mode="primary" onclick={() => (create = true)}>
        {$_("projects.create")}
      </Button>
    {/if}
  {/snippet}
</SidebarLayout>

{#if create}
  <Portal>
    <Modal onclose={() => (create = false)}>
      {#snippet title()}
        <h1>{$_("projects.create")}</h1>
      {/snippet}
      <EditProject onclose={() => (create = false)} />
    </Modal>
  </Portal>
{/if}

<style>
  .flipV {
    display: flex;
    transform: rotate(180deg);
  }

  .toolbar {
    width: 100%;
    flex-wrap: wrap;
  }
  .w-auto {
    width: auto;
  }

  .resultsCount {
    flex: 1 1 auto;
    text-align: right;
    font-size: var(--font-sm);
    margin: 0.25rem 0.5rem;
  }
</style>
