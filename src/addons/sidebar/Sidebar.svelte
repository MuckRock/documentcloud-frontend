<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { ClockFill16 } from "svelte-octicons";

  import { pinned, type AddOnListItem } from "../browser/AddOnListItem.svelte";
  import ListItem from "./ListItem.svelte";
  import { baseApiUrl } from "../../api/base.js";

  $: console.log($pinned);

  const endpoint = new URL("/api/addons/?active=true&per_page=100", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };

  async function load() {
    console.log("Loading pinned add-ons");
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

<style>
  .addon-sidebar {
    padding: 0 1.5rem;
  }

  h4 a {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0.5em;
  }
</style>

<div class="addon-sidebar">
  <h3><a href="#add-ons">{$_("addonSidebar.title")}</a></h3>
  <h4>
    <a href="#add-ons/runs">
      <ClockFill16 />
      <span>{$_("addonSidebar.runs")}</span>
    </a>
  </h4>

  {#each sort($pinned) as addon (addon.id)}
    <ListItem {addon} />
  {/each}
</div>
