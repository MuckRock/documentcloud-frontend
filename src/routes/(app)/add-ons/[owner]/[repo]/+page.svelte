<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types/orgAndUser";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";
  import AddOnLayout from "@/lib/components/layouts/AddOnLayout.svelte";

  export let data;
  export let form;

  const me: Writable<User> = getContext("me");

  $: addon = data.addon;
  $: query = data.query;
  $: search = data.searchResults;
  $: scheduled = data.scheduled;

  // todo: disable if not premium
  $: organization =
    typeof $me.organization === "object" ? $me.organization : null;
  $: isPremiumUser = isPremiumOrg(organization);
  $: creditBalance = getCreditBalance(organization) ?? 0;
  $: isPremiumAddon =
    addon?.parameters.categories?.includes("premium") ?? false;
  $: disablePremium = isPremiumAddon && (!isPremiumUser || creditBalance === 0);
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnLayout {addon} {query} {search} {disablePremium} {scheduled} />
