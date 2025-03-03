<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOnLayout from "$lib/components/layouts/AddOnLayout.svelte";

  import { values } from "$lib/components/forms/AddOnDispatch.svelte";
  import { schedules } from "$lib/components/addons/ScheduledEvent.svelte";
  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions.js";

  export let data;

  const me = getCurrentUser();

  $: event = data.event;
  $: addon = data.event.addon;
  $: query = data.query;
  $: search = data.searchResults;
  $: scheduled = data.scheduled;
  $: organization =
    typeof $me?.organization === "object" ? $me.organization : null;
  $: isPremiumUser = isPremiumOrg(organization);
  $: creditBalance = getCreditBalance(organization) ?? 0;
  $: isPremiumAddon =
    addon?.parameters?.categories?.includes("premium") ?? false;
  $: disablePremium = isPremiumAddon && (!isPremiumUser || creditBalance === 0);
  $: history = data.history;

  // set initial form values when route changes
  $: values.update((v) => {
    return { ...v, ...event.parameters, event: schedules[event.event] };
  });
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnLayout
  {addon}
  {event}
  {search}
  {query}
  {disablePremium}
  {scheduled}
  {history}
/>
