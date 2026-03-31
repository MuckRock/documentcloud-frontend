<!--
  @component
  Render the default slot if the user is signed in.
  The "signedOut" slot is available as a fallback.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { getCurrentUser, isSignedIn } from "$lib/utils/permissions";

  interface Props {
    children: Snippet;
    signedOut?: Snippet;
  }

  let { children, signedOut }: Props = $props();

  const me = getCurrentUser();
</script>

{#if isSignedIn($me)}
  {@render children?.()}
{:else}
  {@render signedOut?.()}
{/if}
