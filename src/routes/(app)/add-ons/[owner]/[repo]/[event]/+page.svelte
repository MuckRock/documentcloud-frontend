<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { _ } from "svelte-i18n";

  import AddOnLayout from "$lib/components/layouts/AddOnLayout.svelte";

  import { values } from "$lib/components/forms/AddOnDispatch.svelte";
  import { schedules } from "$lib/components/addons/ScheduledEvent.svelte";
  import { isPremiumOrg, getCreditBalance } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions";

  let { data } = $props();

  const me = getCurrentUser();

  let event = $derived(data.event);
  let addon = $derived(data.event.addon);
  let query = $derived(data.query);
  let search = $derived(data.searchResults);
  let scheduled = $derived(data.scheduled);
  let organization = $derived(
    typeof $me?.organization === "object" ? $me.organization : null,
  );
  let isPremiumUser = $derived(isPremiumOrg(organization));
  let creditBalance = $derived(getCreditBalance(organization) ?? 0);
  let isPremiumAddon = $derived(
    addon?.parameters?.categories?.includes("premium") ?? false,
  );
  let disablePremium = $derived(
    isPremiumAddon && (!isPremiumUser || creditBalance === 0),
  );
  let history = $derived(data.history);

  // set initial form values when route changes
  afterNavigate(() => {
    values.update((v) => {
      return { ...v, ...event.parameters, event: schedules[event.event] };
    });
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
