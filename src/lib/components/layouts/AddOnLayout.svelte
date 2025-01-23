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
    XCircle24,
  } from "svelte-octicons";

  import AddOnDispatch, { values } from "../forms/AddOnDispatch.svelte";
  import AddOnMeta from "../addons/AddOnMeta.svelte";
  import History from "../addons/History.svelte";
  import Scheduled from "../addons/Scheduled.svelte";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import Tab from "../common/Tab.svelte";
  import Selection from "../inputs/Selection.svelte";
  import { remToPx } from "$lib/utils/layout";

  import Documents from "../sidebar/Documents.svelte";
  import Projects from "../sidebar/Projects.svelte";
  import AddOns from "../sidebar/AddOns.svelte";

  import { schedules } from "../addons/ScheduledEvent.svelte";
  import { selected } from "../documents/ResultsList.svelte";
  import { getProcessLoader } from "../processing/ProcessContext.svelte";
  import { sidebars } from "./Sidebar.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";
  import DocumentList from "../addons/DocumentList.svelte";
  import Modal from "./Modal.svelte";
  import Flex from "../common/Flex.svelte";
  import { fade, slide } from "svelte/transition";

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

  let clientWidth: number;
  const SMALL_BREAKPOINT = remToPx(30);
  let docSelectModalOpen = false;

  setContext("selected", selected);

  $: action = event
    ? `/add-ons/${addon.repository}/${event.id}/?/update`
    : `/add-ons/${addon.repository}/?/dispatch`;

  $: canSchedule = addon.parameters.eventOptions?.events.some((event) =>
    schedules.includes(event),
  );

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
  <div class="container" slot="content" bind:clientWidth>
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
              {#if addon.parameters.documents && clientWidth <= SMALL_BREAKPOINT}
                <Flex justify="center">
                  <Button
                    ghost
                    mode="primary"
                    on:click={() => (docSelectModalOpen = true)}
                  >
                    {$_("addonDispatchDialog.selectDocuments")}
                  </Button>
                </Flex>
              {/if}
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
      {#if clientWidth > SMALL_BREAKPOINT}
        <div class="docs">
          <DocumentList {search} {query} />
        </div>
      {:else if docSelectModalOpen}
        <div class="backdrop" transition:fade></div>
        <div class="doc-picker-drawer" transition:slide>
          <header>
            <h2>{$_("addonDispatchDialog.selectDocuments")}</h2>
            <Button
              ghost
              on:click={() => (docSelectModalOpen = false)}
              minW={false}
            >
              <XCircle24 />
            </Button>
          </header>
          <main>
            <DocumentList {search} {query} />
          </main>
        </div>
      {/if}
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
  .backdrop {
    position: fixed;
    bottom: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-drawer);
    background: rgba(92, 113, 124, 0.5);
    backdrop-filter: blur(2px);
  }
  .doc-picker-drawer {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 90vh;
    z-index: var(--z-drawer);
    display: flex;
    flex-direction: column;
  }
  .doc-picker-drawer header {
    flex: 0 1 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: var(--white);
    border-top: 1px solid var(--gray-3);
    border-bottom: 1px solid var(--gray-2);
    border-top-right-radius: 0.5rem;
    border-top-left-radius: 0.5rem;
    & h2 {
      font-weight: 600;
      font-size: var(--font-lg);
    }
  }
  .doc-picker-drawer main {
    flex: 1 1 auto;
    overflow-y: auto;
  }
</style>
