<!--
  @component
  Render the default slot if the user is signed in.
  The "signedOut" slot is available as a fallback.
-->
<script lang="ts">
  import { getCurrentUser, isSignedIn } from "$lib/utils/permissions";

  const me = getCurrentUser();
</script>

{#if isSignedIn($me)}
  <slot />
{:else}
  <slot name="signedOut" />
{/if}
