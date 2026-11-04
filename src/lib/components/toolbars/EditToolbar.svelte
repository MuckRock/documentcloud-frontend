<!-- @component
Must be a child of a ViewerContext
 -->

<script lang="ts">
  import type { WriteMode } from "$lib/api/types";

  import { page } from "$app/state";

  import { _ } from "svelte-i18n";
  import { File16, Apps16, ChevronDown12 } from "svelte-octicons";

  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import PageToolbar from "$lib/components/toolbars/PageToolbar.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Tab from "$lib/components/common/Tab.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getQuery } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";

  let { query = getQuery(page.url, "q") } = $props();

  let width: number = $state(800);

  const viewer = getViewerState();

  const editModes: Map<WriteMode, string> = new Map([
    ["edit", $_("mode.document")],
    ["bulk", $_("mode.grid")],
  ]);

  const icons = {
    edit: File16,
    bulk: Apps16,
  };

  let document = $derived(viewer.document!);
  let BREAKPOINTS = $derived({
    READ_MENU: width > remToPx(52),
  });

  let current = $derived(
    Array.from(editModes ?? []).find(([value]) => value === viewer.mode)?.[1],
  );
</script>

<PageToolbar bind:width>
  {#snippet left()}
    {#if BREAKPOINTS.READ_MENU}
      <div class="tabs" role="tablist">
        {#each editModes.entries() as [value, name]}
          <Tab
            active={viewer.mode === value}
            href={getViewerHref({
              document,
              mode: value,
              embed: viewer.embed,
              query,
            })}
          >
            {@const TabIcon = icons[value]}
            {#if TabIcon}
              <TabIcon />
            {/if}
            {name}
          </Tab>
        {/each}
      </div>
    {:else}
      <Dropdown position="bottom-start">
        {#snippet anchor()}
          <NavItem>
            {#snippet start()}
              {@const CurrentModeIcon = icons[viewer.mode]}
              {#if CurrentModeIcon}
                <CurrentModeIcon />
              {/if}
            {/snippet}
            {current}
            {#snippet end()}
              <ChevronDown12 />
            {/snippet}
          </NavItem>
        {/snippet}
        {#snippet inner({ close })}
          <Menu>
            {#each editModes.entries() as [value, name]}
              <MenuItem
                selected={viewer.mode === value}
                href={getViewerHref({
                  document,
                  mode: value,
                  embed: viewer.embed,
                  query,
                })}
                preserveQS
                onclick={close}
              >
                {@const Icon = icons[value]}
                {#if Icon}
                  {#snippet icon()}<Icon />{/snippet}
                {/if}
                {name}
              </MenuItem>
            {/each}
          </Menu>
        {/snippet}
      </Dropdown>
    {/if}
  {/snippet}
  {#snippet right()}{/snippet}
</PageToolbar>

<style>
  .tabs {
    display: flex;
    padding: 0 1rem;
  }
</style>
