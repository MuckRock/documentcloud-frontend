<script lang="ts">
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";

  import AddOnBrowser from "@/lib/components/layouts/AddOnBrowser.svelte";

  export let data;

  $: addons = data.addons;
  $: events = data.events;
  $: runs = data.runs;
  $: active =
    Array.from(($page.url as URL).searchParams.entries()).find(
      ([_, value]) => value === "true",
    )?.[0] ??
    ($page.url as URL).searchParams.get("category") ??
    "all";
</script>

<svelte:head>
  <title>Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnBrowser {addons} {events} {runs} {active} />
