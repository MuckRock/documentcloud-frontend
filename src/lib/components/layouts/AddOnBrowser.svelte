<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import { Hourglass24, Plug24 } from "svelte-octicons";

  import AddOnsNavigation from "$lib/components/addons/AddOnsNavigation.svelte";
  import ContentLayout from "$lib/components/layouts/ContentLayout.svelte";
  import Empty from "$lib/components/common/Empty.svelte";
  import Error from "$lib/components/common/Error.svelte";
  import History from "$lib/components/addons/History.svelte";
  import ListItem from "$lib/components/addons/AddOnListItem.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Pin from "@/common/icons/Pin.svelte";
  import Premium from "@/common/icons/Premium.svelte";
  import Scheduled from "$lib/components/addons/Scheduled.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import Star from "@/common/icons/Star.svelte";
  import Tip from "$lib/components/common/Tip.svelte";
  import type { Page } from "@/lib/api/types";
  import type { AddOnListItem, Event, Run } from "@/addons/types";

  export let addons: Promise<Page<AddOnListItem>>;
  export let events: Promise<Page<Event>>;
  export let runs: Promise<Page<Run>>;
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

<div class="container">
  <nav class="nav">
    <AddOnsNavigation {active} />
  </nav>
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
        <Empty icon={Hourglass24}>{$_("addonBrowserDialog.loading")}</Empty>
      {:then page}
        {#each page.results as addon}
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
          {:then page}
            <Paginator
              has_next={Boolean(page.next)}
              has_previous={Boolean(page.previous)}
              on:next={() => paginate(page.next)}
              on:previous={() => paginate(page.previous)}
            />
          {/await}
        </svelte:fragment>
      </PageToolbar>
    </ContentLayout>
  </main>
  <aside class="history">
    {#await events}
      <Empty icon={Hourglass24}>{$_("addonBrowserDialog.loading")}</Empty>
    {:then events}
      <Scheduled
        events={events.results}
        next={events.next}
        previous={events.previous}
      />
    {/await}

    {#await runs}
      <Empty icon={Hourglass24}>{$_("addonBrowserDialog.loading")}</Empty>
    {:then runs}
      <History runs={runs.results} next={runs.next} previous={runs.previous} />
    {/await}
  </aside>
</div>

<style>
  .tip {
    margin: 1rem;
  }
  nav,
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
  }
  .container {
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
    max-height: 100%;
    display: grid;
    grid-template-columns: 16rem 2fr 40%;
    grid-template-rows: 1fr;
  }
</style>
