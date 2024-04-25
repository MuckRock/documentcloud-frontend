<!--
  @component
  Render the default slot if the user is signed in.
  The "signedOut" slot is available as a fallback.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import type { User } from "@/api/types";

  const me = getContext<Writable<User>>("me");
</script>

{#if $me}
  <slot />
{:else}
  <slot name="signedOut" />
{/if}
