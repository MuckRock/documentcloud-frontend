<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { isOrg, type User } from "@/api/types";

  const me = getContext<Writable<User>>("me");

  $: org = $me.organization;
  $: isPremium = isOrg(org)
    ? ["Organization", "Professional"].includes(org.plan)
    : false;
</script>

{#if isPremium}
  <slot />
{:else}
  <slot name="basic" />
{/if}
