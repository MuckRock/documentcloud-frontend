<script lang="ts">
  import type {
    DocumentResults,
    Maybe,
    Page,
    AddOnListItem,
    Event,
    Run,
  } from "$lib/api/types";

  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import { setContext } from "svelte";
  import {
    Clock16,
    History16,
    Hourglass24,
    Play16,
    SidebarExpand16,
  } from "svelte-octicons";

  import AddOnDispatch, { values } from "../forms/AddOnDispatch.svelte";
  import AddOnMeta from "../addons/AddOnMeta.svelte";
  import ContentLayout from "./ContentLayout.svelte";
  import Empty from "../common/Empty.svelte";
  import History from "../addons/History.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import ResultsList, {
    selected,
    selectedIds,
    total,
    visible,
  } from "../documents/ResultsList.svelte";
  import Scheduled from "../addons/Scheduled.svelte";
  import Search from "../forms/Search.svelte";
  import Selection from "$lib/components/inputs/Selection.svelte";
  import Tab from "../common/Tab.svelte";

  import { schedules } from "../addons/ScheduledEvent.svelte";
  import { getProcessLoader } from "../processing/ProcessContext.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import Documents from "../sidebar/Documents.svelte";
  import Projects from "../sidebar/Projects.svelte";
  import AddOns from "../sidebar/AddOns.svelte";
  import Flex from "../common/Flex.svelte";
  import { sidebars } from "./Sidebar.svelte";
  import Button from "../common/Button.svelte";

  export let addon: AddOnListItem;
  export let event: Event | null = null;
  export let scheduled: Promise<Maybe<Page<Event>>> | null = null;
  export let history: Promise<Maybe<Page<Run>>> | null = null;
  export let search: Promise<Maybe<DocumentResults>>;
  export let query: string;
  export let disablePremium: boolean = false;

  type Tab = "dispatch" | "history" | "scheduled";
  const tabs: Tab[] = ["dispatch", "history", "scheduled"];

  function getDefaultTab(): Tab {
    const hash = $page.url.hash?.slice(1);
    if (tabs.some((tab) => tab === hash)) return hash as Tab;
    return "dispatch";
  }

  let currentTab: Tab = getDefaultTab();

  setContext("selected", selected);

  $: action = event
    ? `/add-ons/${addon.repository}/${event.id}/?/update`
    : `/add-ons/${addon.repository}/?/dispatch`;

  $: canSchedule = addon.parameters.eventOptions?.events.some((event) =>
    schedules.includes(event),
  );

  function selectAll(e) {
    if (e.target.checked) {
      $selectedIds = [...$visible.keys()];
    } else {
      $selectedIds = [];
    }
  }

  const load = getProcessLoader();

  // go to the correct tab after submitting
  function onDispatch({ detail }) {
    if (detail.type === "event") {
      currentTab = "scheduled";
    }

    if (detail.type === "run") {
      currentTab = "history";
      // load processing data
      load?.();
    }
  }
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>
  <div class="container" slot="content">
    <section class="addon">
      <header>
        {#if !addon.parameters.documents && $sidebars["navigation"] === false}
          <div class="toolbar w-auto">
            <Button
              ghost
              minW={false}
              on:click={() => ($sidebars["navigation"] = true)}
            >
              <span class="flipV">
                <SidebarExpand16 />
              </span>
            </Button>
          </div>
        {/if}
        <AddOnMeta {addon} />
      </header>
      <div class="tabs" role="tablist">
        <Tab
          active={currentTab === "dispatch"}
          on:click={() => (currentTab = "dispatch")}
        >
          <Play16 />
          {$_("addonDispatchDialog.dispatch")}
        </Tab>

        <Tab
          active={currentTab === "history"}
          on:click={() => (currentTab = "history")}
        >
          <History16 />
          {$_("addonDispatchDialog.history")}
        </Tab>

        {#if canSchedule}
          <Tab
            active={currentTab === "scheduled"}
            on:click={() => (currentTab = "scheduled")}
          >
            <Clock16 />
            {$_("addonDispatchDialog.scheduled")}
          </Tab>
        {/if}
      </div>
      <main>
        {#if currentTab === "scheduled"}
          {#await scheduled}
            <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
          {:then scheduled}
            {#if scheduled}
              <Scheduled
                events={scheduled.results}
                next={scheduled.next}
                previous={scheduled.previous}
              />
            {/if}
          {/await}
        {:else if currentTab === "history"}
          <div class="padding">
            {#await history}
              <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
            {:then history}
              {#if history}
                <History
                  runs={history.results}
                  next={history.next}
                  previous={history.previous}
                />
              {:else}
                <Empty>{$_("addonDispatchDialog.noHistory")}</Empty>
              {/if}
            {/await}
          </div>
        {:else}
          <AddOnDispatch
            {action}
            {event}
            properties={addon.parameters.properties}
            required={addon.parameters.required}
            eventOptions={addon.parameters.eventOptions}
            {disablePremium}
            on:dispatch={onDispatch}
          >
            <svelte:fragment slot="selection">
              {#await search then results}
                <Selection
                  bind:value={$values["selection"]}
                  documents={new Set(addon.parameters.documents)}
                  resultsCount={results?.count}
                  {query}
                />
              {/await}
            </svelte:fragment>
          </AddOnDispatch>
        {/if}
      </main>
    </section>
    {#if addon.parameters.documents}
      <div class="docs">
        <ContentLayout>
          <Flex slot="header">
            {#if $sidebars["navigation"] === false}
              <div class="toolbar w-auto">
                <Button
                  ghost
                  minW={false}
                  on:click={() => ($sidebars["navigation"] = true)}
                >
                  <span class="flipV">
                    <SidebarExpand16 />
                  </span>
                </Button>
              </div>
            {/if}
            <PageToolbar>
              <Search name="q" {query} slot="center" />
            </PageToolbar>
          </Flex>
          <svelte:fragment>
            {#await search}
              <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
            {:then search}
              <ResultsList
                results={search?.results}
                next={search?.next}
                count={search?.count}
                auto
              />
            {/await}
          </svelte:fragment>

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
                {$selected.length.toLocaleString()} {$_("inputs.selected")}
              {:else}
                {$_("inputs.selectAll")}
              {/if}
            </label>

            <svelte:fragment slot="right">
              {#if $visible && $total}
                {$_("inputs.resultsCount", {
                  values: { n: $visible.size, total: $total },
                })}
              {/if}
            </svelte:fragment>
          </PageToolbar>
        </ContentLayout>
      </div>
    {/if}
  </div>
</SidebarLayout>

<style>
  .container {
    display: flex;
    flex-direction: row-reverse;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: var(--app-max-w, 100rem);
    margin: 0 auto;
  }
  .addon,
  .docs {
    flex: 1 1 50%;
    max-width: 48rem;
    overflow-y: auto;
  }
  .addon {
    height: min-content;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .addon header {
    margin-bottom: 1rem;
    padding: 1rem;
  }
  .addon .tabs {
    display: flex;
    padding: 0 1rem;
    border-bottom: 1px solid var(--gray-2);
  }
  .docs {
    margin: 1rem;
    background-color: var(--gray-1);
    border: 1px solid var(--gray-2);
    border-radius: var(--radius, 0.5rem);
  }
  .padding {
    padding: 1rem;
  }
  .flipV {
    display: flex;
    transform: rotate(180deg);
  }
  header .toolbar {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
</style>
