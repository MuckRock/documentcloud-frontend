<script lang="ts">
  import type { Writable } from "svelte/store";

  import type {
    Document,
    ReadMode,
    ViewerMode,
    WriteMode,
  } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    Comment16,
    EyeClosed16,
    File16,
    Typography16,
    Apps16,
    Note16,
    ChevronDown12,
  } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import PageToolbar from "$lib/components/common/PageToolbar.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Search from "$lib/components/forms/Search.svelte";

  import Dropdown2, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Menu from "@/common/Menu.svelte";
  import MenuItem from "@/common/MenuItem.svelte";
  import SidebarItem from "../../sidebar/SidebarItem.svelte";

  import { remToPx } from "$lib/utils/layout";

  export let document: Document;
  export let query: string = "";
  export let embed: boolean = getContext("embed") ?? false; // are we embedded?

  let width: number;

  const mode: Writable<ViewerMode> = getContext("currentMode");

  $: canWrite = !embed && document.edit_access;
  $: BREAKPOINTS = {
    READ_MENU: width > remToPx(52),
    WRITE_MENU: width < remToPx(37),
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
          <Tab active={$mode === value} href="?mode={value}">
            <svelte:component this={icons[value]} />
            {name}
          </Tab>
        {/each}
      </div>
    {:else}
      <Dropdown2 id="reading-mode" position="bottom left">
        <div class="toolbarItem" slot="title">
          <SidebarItem>
            <svelte:component this={icons[$mode]} />
            {Array.from(readModes).find(([value]) => value === $mode)[1]}
            <ChevronDown12 />
          </SidebarItem>
        </div>
        <Menu>
          {#each readModes.entries() as [value, name]}
            <MenuItem
              selected={$mode === value}
              href="?mode={value}"
              on:click={() => closeDropdown("reading-mode")}
            >
              <svelte:component this={icons[value]} slot="icon" />
              {name}
            </MenuItem>
          {/each}
          {#if BREAKPOINTS.WRITE_MENU && canWrite}
            {#each writeModes as [value, name]}
              <MenuItem
                selected={$mode === value}
                href="?mode={value}"
                on:click={() => closeDropdown("reading-mode")}
              >
                <svelte:component this={icons[value]} slot="icon" />
                {name}
              </MenuItem>
            {/each}
          {/if}
        </Menu>
      </Dropdown2>
    {/if}
  </svelte:fragment>
  <Flex justify="end" slot="right">
    {#if !BREAKPOINTS.WRITE_MENU && canWrite}
      {#each writeModes as [value, name]}
        <Button ghost href="?mode={value}">
          <svelte:component this={icons[value]} />
          {name}
        </Button>
      {/each}
    {/if}
    <Search name="q" {query} />
  </Flex>
</PageToolbar>

<style>
  .tabs {
    display: flex;
    padding: 0 1rem;
  }
</style>
