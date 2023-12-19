<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { ClockFill16 } from "svelte-octicons";

  import { pinned } from "../../../../addons/AddOnPin.svelte";
  import type { AddOnListItem } from "../../../../addons/types";
  import ListItem from "../ListItem.svelte";
  import AddonListItem from "./AddonListItem.svelte";
  import { baseApiUrl } from "../../../../api/base.js";
  import ListHeader from "../ListHeader.svelte";
  import Button from "../../../../common/Button.svelte";

  const endpoint = new URL("/api/addons/?active=true&per_page=100", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };

  async function load() {
    const res = await fetch(endpoint, options)
      .then((r) => r.json())
      .catch((err) => {
        console.error(err);
        return { results: [] };
      });

    $pinned = res.results;
  }

  function sort(addons: AddOnListItem[]) {
    return addons.sort((a, b) => a.name.localeCompare(b.name));
  }

  onMount(async () => {
    await load();
  });
</script>

<ListHeader>
  {$_("addonSidebar.title")}
  <Button href="#add-ons" small={true} slot="action">Browse</Button>
</ListHeader>
<ListItem href="#add-ons/runs" label={$_("addonSidebar.runs")}>
  <span slot="icon" class="runs-icon"><ClockFill16 /></span>
</ListItem>
{#if $pinned.length}
  <ul class="addons">
    {#each sort($pinned) as addon (addon.id)}
      <li><AddonListItem {addon} /></li>
    {/each}
  </ul>
{/if}

<style>
  .runs-icon {
    fill: var(--gray);
  }

  ul {
    margin: 0.5rem 0 0;
    padding: 0;
    list-style-type: none;
  }

  li {
    margin: 0.25em 0;
  }
</style>
