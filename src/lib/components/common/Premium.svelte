<!--
  @component
  Render the default slot if the user has a premium account (individual or organization).
  The "basic" slot is available as a fallback.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { isOrg } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions";

  interface Props {
    children?: Snippet;
    basic?: Snippet;
  }

  let { children, basic }: Props = $props();

  const me = getCurrentUser();

  let org = $derived($me?.organization);
  let isPremium = $derived(
    isOrg(org) && org.plan
      ? ["Organization", "Professional"].includes(org.plan)
      : false,
  );
</script>

{#if isPremium}
  {@render children?.()}
{:else}
  {@render basic?.()}
{/if}
