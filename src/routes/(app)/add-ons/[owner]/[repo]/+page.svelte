<script lang="ts">
  import { _ } from "svelte-i18n";

  import AddOnLayout from "$lib/components/layouts/AddOnLayout.svelte";
  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions";

  let { data } = $props();

  const me = getCurrentUser();

  let addon = $derived(data.addon);
  let query = $derived(data.query);
  let search = $derived(data.searchResults);
  let scheduled = $derived(data.scheduled);
  let organization = $derived(
    typeof $me?.organization === "object" ? $me.organization : null,
  );
  let creditBalance = $derived(getCreditBalance(organization) ?? 0);
  let isPremiumAddon = $derived(
    addon?.parameters.categories?.includes("premium") ?? false,
  );
  let disablePremium = $derived(
    isPremiumAddon && creditBalance === 0,
  );
  let history = $derived(data.history);
</script>

<svelte:head>
  <title>{addon.name} | Add-Ons | DocumentCloud</title>
</svelte:head>

<AddOnLayout {addon} {query} {search} {disablePremium} {scheduled} {history} />
