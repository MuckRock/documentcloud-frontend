<script lang="ts">
  import { _ } from "svelte-i18n";
  import Flex from "../common/Flex.svelte";
  import PageToolbar from "../common/PageToolbar.svelte";
  import Search from "../forms/Search.svelte";
  import { remToPx } from "$lib/utils/layout";
  import Dropdown from "../common/Dropdown.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import { ChevronDown12, Paintbrush16 } from "svelte-octicons";
  import Menu from "../common/Menu.svelte";
  import { type Writable } from "svelte/store";
  import { getContext } from "svelte";
  import { type VisibleFields } from "../documents/DocumentListItem.svelte";
  import FieldLabel from "../common/FieldLabel.svelte";

  export let query: string = "";

  let headerToolbarWidth: number;

  const visibleFields = getContext<Writable<VisibleFields>>("visibleFields");
  $: console.log($visibleFields);
</script>

<PageToolbar bind:width={headerToolbarWidth}>
  <Flex slot="left">
    <Dropdown>
      <SidebarItem slot="anchor">
        <Paintbrush16 slot="start" />
        {$_("common.customize")}
        <ChevronDown12 slot="end" />
      </SidebarItem>
      <Menu>
        <form>
          {#each Object.entries($visibleFields) as [key, value], index}
            <label class="visibleField">
              <input
                type="checkbox"
                name={key}
                bind:checked={$visibleFields[key]}
              />
              <FieldLabel>{key}</FieldLabel>
            </label>
          {/each}
        </form>
      </Menu>
    </Dropdown>
  </Flex>
  <Flex slot="right">
    <div style:flex="1 1 auto">
      <Search name="q" {query} placeholder={$_("common.search")} />
      <p class="help" class:hide={headerToolbarWidth < remToPx(38)}>
        {@html $_("search.help")}
        <a target="_blank" href="/help/search/">
          {$_("search.more")}
        </a>
      </p>
    </div>
  </Flex>
</PageToolbar>

<style>
  .visibleField {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .help {
    flex: 1 1 100%;
    font-size: var(--font-xs);
    margin: 0.25rem;
    color: var(--gray-4);
    text-align: left;
  }
  .hide {
    display: none;
  }
</style>
