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
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Search from "$lib/components/forms/Search.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getViewerHref } from "$lib/utils/viewer";
  import { getQuery } from "$lib/utils/search";
  import {
    getCurrentMode,
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";

  export let query = getQuery($page.url, "q");

  let width: number;

  const documentStore = getDocument();
  const mode = getCurrentMode();
  const embed = isEmbedded();

  $: document = $documentStore;
  $: canWrite = !embed && document.edit_access;
  $: BREAKPOINTS = {
    READ_MENU: width > remToPx(52),
    WRITE_MENU: width < remToPx(37),
    SEARCH_MENU: width < remToPx(24),
  };

  const readModes: Map<ReadMode, string> = new Map([
    ["document", $_("mode.document")],
    ["text", $_("mode.text")],
    ["grid", $_("mode.grid")],
    ["notes", $_("mode.notes")],
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
  };
</script>

<PageToolbar bind:width>
  <svelte:fragment slot="left">
    {#if BREAKPOINTS.READ_MENU}
      <div class="tabs" role="tablist">
        {#each readModes.entries() as [value, name]}
          <Tab
            active={$mode === value}
            href={getViewerHref({ document, mode: value, embed })}
          >
            <svelte:component this={icons[value]} />
            {name}
          </Tab>
        {/each}
      </div>
    {:else}
      <Dropdown position="bottom-start">
        <SidebarItem slot="anchor">
          <svelte:component this={icons[$mode]} slot="start" />
          {Array.from(readModes ?? []).find(([value]) => value === $mode)?.[1]}
          <ChevronDown12 slot="end" />
        </SidebarItem>
        <Menu slot="default" let:close>
          {#each readModes.entries() as [value, name]}
            <MenuItem
              selected={$mode === value}
              href={getViewerHref({ document, mode: value, embed })}
              on:click={close}
            >
              <svelte:component this={icons[value]} slot="icon" />
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
                <svelte:component this={icons[value]} slot="icon" />
                {name}
              </MenuItem>
            {/each}
          {/if}
        </Menu>
      </Dropdown>
    {/if}
  </svelte:fragment>
  <Flex justify="end" slot="right">
    {#if !BREAKPOINTS.WRITE_MENU && canWrite}
      {#each writeModes as [value, name]}
        <Button ghost href={getViewerHref({ document, mode: value, embed })}>
          <span class="icon"><svelte:component this={icons[value]} /></span>
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
        <Menu>
          <Search name="q" {query} />
        </Menu>
      </Dropdown>
    {:else}
      <Search name="q" {query} />
    {/if}
  </Flex>
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
