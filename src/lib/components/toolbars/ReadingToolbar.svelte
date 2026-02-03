<!-- @component
Assumes it's a child of a ViewerContext
 -->

<script lang="ts">
  import type { ReadMode, WriteMode } from "$lib/api/types";

  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import {
    Comment16,
    EyeClosed16,
    File16,
    Typography16,
    Apps16,
    Note16,
    ChevronDown12,
    Search16,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import PageToolbar from "$lib/components/toolbars/PageToolbar.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Tab from "$lib/components/common/Tab.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getQuery } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";
  import {
    getCurrentMode,
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";

  let { query = getQuery($page.url, "q") } = $props();

  let width: number = $state(800);

  const documentStore = getDocument();
  const mode = getCurrentMode();
  const embed = isEmbedded();

  const readModeTabs: Map<ReadMode, string> = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["grid", $_("mode.grid")],
    ["notes", $_("mode.notes")],
  ]);

  const readModeDropdownItems: Map<ReadMode, string> = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["grid", $_("mode.grid")],
    ["notes", $_("mode.notes")],
    ["search", $_("mode.search")],
  ]);

  const writeModes: Map<WriteMode, string> = new Map([
    ["annotating", $_("mode.annotating")],
    ["redacting", $_("mode.redacting")],
  ]);

  const icons = {
    document: File16,
    text: Typography16,
    grid: Apps16,
    notes: Note16,
    annotating: Comment16,
    redacting: EyeClosed16,
    search: Search16,
  };

  let document = $derived($documentStore);
  let canWrite = $derived(!embed && document.edit_access);
  let BREAKPOINTS = $derived({
    READ_MENU: width > remToPx(52),
    WRITE_MENU: width < remToPx(37),
    SEARCH_MENU: width < remToPx(24),
  });

  let current = $derived(
    Array.from(readModeDropdownItems ?? []).find(
      ([value]) => value === $mode,
    )?.[1],
  );
</script>

<PageToolbar bind:width>
  {#snippet left()}
    {#if BREAKPOINTS.READ_MENU}
      <div class="tabs" role="tablist">
        {#each readModeTabs.entries() as [value, name]}
          <Tab
            active={$mode === value}
            href={getViewerHref({ document, mode: value, embed, query })}
          >
            {@const SvelteComponent = icons[value]}
            <SvelteComponent />
            {name}
          </Tab>
        {/each}
      </div>
    {:else}
      <Dropdown position="bottom-start">
        <NavItem slot="anchor">
          {@const SvelteComponent_1 = icons[$mode]}
          <SvelteComponent_1 slot="start" />
          {current}
          <ChevronDown12 slot="end" />
        </NavItem>
        <Menu slot="inner" let:close>
          {#each readModeDropdownItems.entries() as [value, name]}
            <MenuItem
              selected={$mode === value}
              href={getViewerHref({ document, mode: value, embed, query })}
              preserveQS
              on:click={close}
            >
              {@const SvelteComponent_2 = icons[value]}
              <SvelteComponent_2 slot="icon" />
              {name}
            </MenuItem>
          {/each}
          {#if BREAKPOINTS.WRITE_MENU && canWrite}
            {#each writeModes as [value, name]}
              <MenuItem
                selected={$mode === value}
                href={getViewerHref({ document, mode: value, embed })}
                on:click={close}
              >
                {@const SvelteComponent_3 = icons[value]}
                <SvelteComponent_3 slot="icon" />
                {name}
              </MenuItem>
            {/each}
          {/if}
        </Menu>
      </Dropdown>
    {/if}
  {/snippet}
  {#snippet right()}
    <Flex justify="end">
      {#if !BREAKPOINTS.WRITE_MENU && canWrite}
        {#each writeModes as [value, name]}
          <Button
            ghost
            href={getViewerHref({ document, mode: value, embed, query })}
          >
            {@const SvelteComponent_4 = icons[value]}
            <span class="icon"><SvelteComponent_4 /></span>
            {name}
          </Button>
        {/each}
      {/if}
      {#if BREAKPOINTS.SEARCH_MENU}
        <Dropdown position="bottom-end">
          <Button minW={false} ghost slot="anchor">
            <Search16 />
            {$_("common.search")}
          </Button>
          <Menu slot="inner">
            <Search name="q" {query} otherParams={{ mode: "search" }} />
          </Menu>
        </Dropdown>
      {:else}
        <Search name="q" {query} otherParams={{ mode: "search" }} />
      {/if}
    </Flex>
  {/snippet}
</PageToolbar>

<style>
  .tabs {
    display: flex;
    padding: 0 1rem;
  }
  .icon {
    flex: 0 0 auto;
    display: inline-flex;
  }
</style>
