<script lang="ts">
  import type {
    Page,
    APIResponse,
    AddOnListItem,
    Event,
    Run,
  } from "$lib/api/types";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import { Hourglass24, Plug24 } from "svelte-octicons";

  import Scheduled from "$lib/components/addons/Scheduled.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import History from "$lib/components/addons/History.svelte";
  import ListItem from "$lib/components/addons/AddOnListItem.svelte";
  import PageToolbar from "@/lib/components/toolbars/PageToolbar.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
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

  export let addons: Promise<APIResponse<Page<AddOnListItem>>>;
  export let events: Promise<APIResponse<Page<Event>>>;
  export let runs: Promise<APIResponse<Page<Run>>>;
  export let active: string = "all";
  export let query: string = "";

  // TODO: Improve cursor handling in page data responses
  /** The pagination URL provided in the reponse corresponds to an API query.
   *  This gets the cursor from the pagination URL and uses it to update the
   *  current URL's searchParams value (there should be a smarter way to do this).
   */
  function paginate(pageUrl: string) {
    const url = new URL($page.url); // make a copy
    const cursor = new URL(pageUrl).searchParams.get("cursor");
    if (!cursor) return;
    url.searchParams.set("cursor", cursor);
    goto(url);
  }

  $: showTip = ["active", "featured", "premium"].includes(active);
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>
  <div class="container" slot="content">
    <main>
      <ContentLayout>
        <PageToolbar slot="header">
          <Search name="query" {query} slot="center" />
        </PageToolbar>
        {#if showTip}
          <div class="tip">
            {#if active === "active"}
              <Tip
                --background-color="var(--orange-1)"
                --border-color="var(--orange)"
                --fill="var(--orange-4)"
              >
                <Pin size={1.75} slot="icon" />
                {$_("addonBrowserDialog.pinnedTip")}
              </Tip>
            {:else if active === "featured"}
              <Tip
                --background-color="var(--yellow-1)"
                --border-color="var(--yellow)"
                --fill="var(--yellow-4)"
              >
                <Star size={1.75} slot="icon" />
                {$_("addonBrowserDialog.featuredTip")}
              </Tip>
            {:else if active === "premium"}
              <Tip
                --background-color="var(--green-1)"
                --border-color="var(--green)"
                --fill="var(--green-4)"
              >
                <Premium size={1.75} slot="icon" />
                {$_("addonBrowserDialog.premiumTip")}
              </Tip>
            {/if}
          </div>
        {/if}
        {#await addons}
          <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
        {:then { data: page }}
          {#each page?.results ?? [] as addon}
            <ListItem {addon} />
          {:else}
            <Empty icon={Plug24}>{$_("addonBrowserDialog.empty")}</Empty>
          {/each}
        {:catch error}
          <Error>{String(error)}</Error>
        {/await}

        <PageToolbar slot="footer">
          <svelte:fragment slot="center">
            {#await addons}
              <Paginator />
            {:then { data: page }}
              <Paginator
                has_next={Boolean(page?.next)}
                has_previous={Boolean(page?.previous)}
                on:next={() => {
                  if (page?.next) paginate(page.next);
                }}
                on:previous={() => {
                  if (page?.previous) paginate(page.previous);
                }}
              />
            {/await}
          </svelte:fragment>
        </PageToolbar>
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
  }
  .history {
    max-width: unset;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 1rem;
  }
</style>
