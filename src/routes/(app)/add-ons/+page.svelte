<script lang="ts">
  import { page } from "$app/state";

  import { _ } from "svelte-i18n";

  import AddOnBrowser from "$lib/components/layouts/AddOnBrowser.svelte";

  let { data } = $props();

  let addons = $derived(data.addons);
  let events = $derived(data.events);
  let runs = $derived(data.runs);
  let active = $derived(
    Array.from(page.url.searchParams.entries()).find(
      ([_, value]) => value === "true",
    )?.[0] ??
      page.url.searchParams.get("category") ??
      "all",
  );
  let query = $derived(page.url.searchParams.get("query") ?? "");
</script>

<svelte:head>
  <title>Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnBrowser {addons} {events} {runs} {active} {query} />
