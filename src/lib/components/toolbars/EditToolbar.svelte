<!-- @component
Must be a child of a ViewerContext
 -->

<script lang="ts">
  import type { WriteMode } from "$lib/api/types";

  import { page } from "$app/state";

  import { _ } from "svelte-i18n";
  import {
    File16,
    Apps16,
    ChevronDown12,
    Pencil16,
    Question16,
    X16,
    Undo16,
    Check16,
  } from "svelte-octicons";

  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Tab from "$lib/components/common/Tab.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Tooltip from "$lib/components/common/Tooltip.svelte";
  import Button from "$lib/components/common/Button.svelte";

  import { remToPx } from "$lib/utils/layout";
  import { getQuery } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { goto } from "$app/navigation";

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
    EXPANDED: width > remToPx(52),
    X_SMALL: width < remToPx(30),
  });

  let current = $derived(
    Array.from(editModes ?? []).find(([value]) => value === viewer.mode)?.[1],
  );

  function cancel() {
    const href = getViewerHref({ document });
    if (viewer.history.hasEntries) {
      if (confirm($_("editMode.cancelWarning"))) {
        viewer.history.discard();
        goto(href);
      }
    } else {
      goto(href);
    }
  }
</script>

<div class="toolbar" bind:clientWidth={width}>
  {#if BREAKPOINTS.EXPANDED}
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
          {#if !BREAKPOINTS.X_SMALL}
            {current}
          {/if}
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
  <div class="controls">
    <Flex align="center">
      <h3 class="title"><Pencil16 /> {$_("editMode.title")}</h3>
      <Tooltip caption={$_("editMode.instructions")}>
        <Question16 fill="var(--blue-3)" />
      </Tooltip>
    </Flex>
    <Flex gap={BREAKPOINTS.X_SMALL ? 0.5 : 1} justify="end" align="center">
      <Button
        ghost
        size="small"
        mode="danger"
        title={$_("editMode.cancel")}
        minW={false}
        onclick={cancel}
      >
        <X16 />
        {#if BREAKPOINTS.EXPANDED}
          {$_("editMode.cancel")}
        {/if}
      </Button>
      <Button
        size="small"
        ghost
        disabled={!viewer.history.hasEntries}
        title={$_("editMode.undo")}
        minW={false}
        onclick={() => viewer.history.undo()}
      >
        <Undo16 />
        {#if BREAKPOINTS.EXPANDED}
          {$_("editMode.undo")}
        {/if}
      </Button>
      <Button
        size="small"
        mode="primary"
        title={$_("editMode.confirm")}
        minW={!BREAKPOINTS.X_SMALL}
        onclick={() => {}}
      >
        <Check16 />
        {#if BREAKPOINTS.EXPANDED}
          {$_("editMode.confirm")}
        {/if}
      </Button>
    </Flex>
  </div>
</div>

<style>
  .tabs {
    display: flex;
    padding: 0 1rem;
  }

  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
  }

  .title {
    font-weight: var(--font-semibold);
    font-size: var(--font-md);
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: 0.5rem;
  }

  .controls {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    text-align: left;
  }
</style>
