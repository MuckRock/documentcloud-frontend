<script lang="ts">
  import type { Page, APIResponse, AddOn, Event, Run } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Hourglass24, Plug24 } from "svelte-octicons";

  import { SearchResultsState } from "$lib/state/search.svelte";

  import Scheduled from "$lib/components/addons/Scheduled.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import History from "$lib/components/addons/History.svelte";
  import ListItem from "$lib/components/addons/AddOnListItem.svelte";
  import PageToolbar from "$lib/components/toolbars/PageToolbar.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Pin from "$lib/components/icons/Pin.svelte";
  import Premium from "$lib/components/icons/Premium.svelte";
  import Star from "$lib/components/icons/Star.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Documents from "../sidebar/Documents.svelte";
  import Projects from "../sidebar/Projects.svelte";
  import AddOns from "$lib/components/sidebar/AddOns.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import InfiniteScrollTrigger from "$lib/components/search/InfiniteScrollTrigger.svelte";
  import SearchResultsCount from "$lib/components/search/SearchResultsCount.svelte";

  interface Props {
    addons: Promise<APIResponse<Page<AddOn>>>;
    events: Promise<APIResponse<Page<Event>>>;
    runs: Promise<APIResponse<Page<Run>>>;
    active?: string;
    query?: string;
  }

  let { addons, events, runs, active = "all", query = "" }: Props = $props();

  const search = new SearchResultsState<AddOn>({ loading: true });

  $effect(() => {
    search.setResults(addons);
  });

  let showTip = $derived(["active", "featured", "premium"].includes(active));
</script>

<SidebarLayout>
  {#snippet navigation()}
    <Documents />
    <Projects />
    <AddOns />
  {/snippet}
  {#snippet content()}
    <div class="container">
      <main>
        <ContentLayout>
          {#snippet header()}
            <PageToolbar>
              {#snippet center()}
                <Search name="query" {query} />
              {/snippet}
            </PageToolbar>
          {/snippet}
          {#if showTip}
            <div class="tip">
              {#if active === "active"}
                <Tip
                  --background-color="var(--orange-1)"
                  --border-color="var(--orange)"
                  --fill="var(--orange-4)"
                >
                  {#snippet icon()}
                    <Pin size={1.75} />
                  {/snippet}
                  {$_("addonBrowserDialog.pinnedTip")}
                </Tip>
              {:else if active === "featured"}
                <Tip
                  --background-color="var(--yellow-1)"
                  --border-color="var(--yellow)"
                  --fill="var(--yellow-4)"
                >
                  {#snippet icon()}
                    <Star size={1.75} />
                  {/snippet}
                  {$_("addonBrowserDialog.featuredTip")}
                </Tip>
              {:else if active === "premium"}
                <Tip
                  --background-color="var(--green-1)"
                  --border-color="var(--green)"
                  --fill="var(--green-4)"
                >
                  {#snippet icon()}
                    <Premium size={1.75} />
                  {/snippet}
                  {$_("addonBrowserDialog.premiumTip")}
                </Tip>
              {/if}
            </div>
          {/if}

          {#each search.results as addon}
            <ListItem {addon} />
          {:else}
            {#if search.loading}
              <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
            {:else}
              <Empty icon={Plug24}>{$_("addonBrowserDialog.empty")}</Empty>
            {/if}
          {/each}

          <InfiniteScrollTrigger {search} />

          {#snippet footer()}
            <PageToolbar>
              {#snippet right()}
                <SearchResultsCount {search} />
              {/snippet}
            </PageToolbar>
          {/snippet}
        </ContentLayout>
      </main>
      <aside class="history">
        {#await events}
          <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
        {:then { data: events }}
          <Scheduled
            events={events?.results ?? []}
            next={events?.next}
            previous={events?.previous}
          />
        {/await}
        {#await runs}
          <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
        {:then { data: runs }}
          <History
            runs={runs?.results ?? []}
            next={runs?.next}
            previous={runs?.previous}
          />
        {/await}
      </aside>
    </div>
  {/snippet}
</SidebarLayout>

<style>
  .tip {
    margin: 1rem;
  }
  .container {
    width: 100%;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    max-height: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }
  aside {
    padding: 1rem 0.5rem;
    max-height: 100%;
    overflow-y: auto;
    z-index: 1;
  }
  main {
    max-height: 100%;
    overflow-y: auto;
    background: var(--gray-1);
    box-shadow: inset var(--shadow-2);
    border-right: 1px solid var(--gray-2);
  }
  .history {
    max-width: unset;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }
</style>
