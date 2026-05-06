<script lang="ts">
  import type { Maybe, Page, AddOn, Event, Run } from "$lib/api/types";

  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";

  import { _ } from "svelte-i18n";
  import { writable } from "svelte/store";
  import { fade, slide } from "svelte/transition";
  import {
    Clock16,
    History16,
    Hourglass24,
    Play16,
    SidebarExpand16,
  } from "svelte-octicons";

  import AddOnDispatch, { values } from "../forms/AddOnDispatch.svelte";
  import AddOnMeta from "../addons/AddOnMeta.svelte";
  import History from "../addons/History.svelte";
  import Scheduled from "../addons/Scheduled.svelte";

  import Button from "../common/Button.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import Selection from "../addons/Selection.svelte";
  import Tab from "../common/Tab.svelte";

  import AddOns from "../sidebar/AddOns.svelte";
  import Documents from "../sidebar/Documents.svelte";
  import DocumentList from "../addons/DocumentList.svelte";
  import Projects from "../sidebar/Projects.svelte";
  import SidebarLayout from "./SidebarLayout.svelte";

  import { schedules } from "../addons/ScheduledEvent.svelte";
  import { getProcessLoader } from "../processing/ProcessContext.svelte";
  import { remToPx } from "$lib/utils/layout";
  import { sidebars } from "./Sidebar.svelte";

  import {
    defaultVisibleFields,
    setVisibleFieldsContext,
  } from "$lib/components/documents/VisibleFields.svelte";
  import { getSearchResults } from "$lib/state/search.svelte";

  interface Props {
    addon: AddOn;
    event?: Maybe<Event>;
    scheduled?: Promise<Maybe<Page<Event>>> | null;
    history?: Promise<Maybe<Page<Run>>> | null;
    query: string;
    disablePremium?: boolean;
  }

  let {
    addon,
    event = undefined,
    scheduled = null,
    history = null,
    query,
    disablePremium = false,
  }: Props = $props();

  const search = getSearchResults();

  type TabChoice = "dispatch" | "history" | "scheduled";
  const tabs: TabChoice[] = ["dispatch", "history", "scheduled"];

  function getDefaultTab(): TabChoice {
    const hash = page.url.hash?.slice(1);
    if (tabs.some((tab) => tab === hash)) return hash as TabChoice;
    return "dispatch";
  }

  let currentTab: TabChoice = $state(getDefaultTab());

  const SMALL_BREAKPOINT = remToPx(30);
  let clientWidth: number = $state(800);
  let docSelectModalOpen = $state(false);

  setVisibleFieldsContext(writable(defaultVisibleFields));

  let action = $derived(
    event
      ? `/add-ons/${addon.repository}/${event.id}/?/update`
      : `/add-ons/${addon.repository}/?/dispatch`,
  );

  let canSchedule = $derived(
    addon.parameters.eventOptions?.events.some((event) =>
      schedules.includes(event),
    ),
  );

  const load = getProcessLoader();

  // go to the correct tab after submitting
  function onDispatch(data: { type: string }) {
    if (data.type === "event") {
      currentTab = "scheduled";
    }

    if (data.type === "run") {
      currentTab = "history";
      // load processing data
      load?.();
    }
  }

  afterNavigate(() => {
    currentTab = "dispatch";
  });
</script>

<SidebarLayout>
  <svelte:fragment slot="navigation">
    <Documents />
    <Projects />
    <AddOns />
  </svelte:fragment>

  <svelte:fragment slot="content">
    <div class="container" bind:clientWidth>
      <section class="addon">
        <header>
          {#if !addon.parameters.documents && $sidebars["navigation"] === false}
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
          <AddOnMeta {addon} />
        </header>
        <div class="tabs" role="tablist">
          <Tab
            active={currentTab === "dispatch"}
            onclick={() => (currentTab = "dispatch")}
          >
            <Play16 />
            {$_("addonDispatchDialog.dispatch")}
          </Tab>

          <Tab
            active={currentTab === "history"}
            onclick={() => (currentTab = "history")}
          >
            <History16 />
            {$_("addonDispatchDialog.history")}
          </Tab>

          {#if canSchedule}
            <Tab
              active={currentTab === "scheduled"}
              onclick={() => (currentTab = "scheduled")}
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
                    {event}
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
              ondispatch={onDispatch}
            >
              {#snippet selection()}
                {#if addon.parameters.documents && clientWidth <= SMALL_BREAKPOINT}
                  <Flex justify="center">
                    <Button
                      ghost
                      mode="primary"
                      onclick={() => (docSelectModalOpen = true)}
                    >
                      {$_("addonDispatchDialog.selectDocuments")}
                    </Button>
                  </Flex>
                {/if}
                <Selection
                  bind:value={$values["selection"]}
                  documents={new Set(addon.parameters.documents)}
                  resultsCount={search.total}
                  {query}
                />
              {/snippet}
            </AddOnDispatch>
          {/if}
        </main>
      </section>
      {#if addon.parameters.documents}
        {#if clientWidth > SMALL_BREAKPOINT}
          <div class="docs">
            <DocumentList {query} />
          </div>
        {:else if docSelectModalOpen}
          <div class="backdrop" transition:fade></div>
          <div class="doc-picker-drawer" transition:slide>
            <header>
              <h2>{$_("addonDispatchDialog.selectDocuments")}</h2>
              <Button
                mode="primary"
                ghost
                onclick={() => (docSelectModalOpen = false)}
                minW={false}
              >
                {$_("dialog.done")}
              </Button>
            </header>
            <main>
              <DocumentList {query} />
            </main>
          </div>
        {/if}
      {/if}
    </div>
  </svelte:fragment>
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
    margin: 0;
    background-color: var(--gray-1);
    border-right: 1px solid var(--gray-2);
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
