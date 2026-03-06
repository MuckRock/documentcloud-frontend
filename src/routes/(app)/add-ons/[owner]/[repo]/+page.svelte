<script lang="ts">
  import { onDestroy } from "svelte";
  import { _ } from "svelte-i18n";

  import AddOnLayout from "$lib/components/layouts/AddOnLayout.svelte";
  import { getCreditBalance } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions";
  import {
    SearchResultsState,
    setSearchResults,
  } from "$lib/state/search.svelte";
  import { deleted, edited } from "$lib/api/documents";
  import {
    getPendingDocuments,
    getFinishedDocuments,
  } from "$lib/components/processing/ProcessContext.svelte";

  let { data } = $props();

  const me = getCurrentUser();

  let addon = $derived(data.addon);
  let query = $derived(data.query);
  let scheduled = $derived(data.scheduled);
  let organization = $derived(
    typeof $me?.organization === "object" ? $me.organization : null,
  );
  let creditBalance = $derived(getCreditBalance(organization) ?? 0);
  let isPremiumAddon = $derived(
    addon?.parameters.categories?.includes("premium") ?? false,
  );
  let disablePremium = $derived(isPremiumAddon && creditBalance === 0);
  let history = $derived(data.history);

  const search = new SearchResultsState({ loading: true });
  setSearchResults(search);

  search.watch({
    deleted,
    edited,
    pending: getPendingDocuments(),
    finished: getFinishedDocuments(),
  });
  onDestroy(search.unwatch);

  $effect(() => {
    search.setResults(data.searchResults);
  });
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnLayout {addon} {query} {disablePremium} {scheduled} {history} />
