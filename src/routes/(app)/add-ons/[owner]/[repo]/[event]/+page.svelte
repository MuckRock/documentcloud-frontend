<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOnLayout from "@/lib/components/layouts/AddOnLayout.svelte";

  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";
  import { getCurrentUser } from "@/lib/utils/permissions.js";

  export let data;
  export let form;

  const me = getCurrentUser();

  $: event = data.event;
  $: addon = data.event.addon;
  $: query = data.query;
  $: search = data.searchResults;
  $: scheduled = data.scheduled;

  // todo: disable if not premium
  $: organization =
    typeof $me.organization === "object" ? $me.organization : null;
  $: isPremiumUser = isPremiumOrg(organization);
  $: creditBalance = getCreditBalance(organization) ?? 0;
  $: isPremiumAddon =
    addon?.parameters?.categories?.includes("premium") ?? false;
  $: disablePremium = isPremiumAddon && (!isPremiumUser || creditBalance === 0);
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnLayout {addon} {event} {search} {query} {disablePremium} {scheduled} />
