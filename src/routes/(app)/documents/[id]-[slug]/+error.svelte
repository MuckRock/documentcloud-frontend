<script lang="ts">
  import { page } from "$app/stores";
  import { _ } from "svelte-i18n";
  import Error from "$lib/components/layouts/Error.svelte";
</script>

<Error status={$page.status}>
  <p slot="message">
    {#if $page.status === 404}
      {$_("notfound.content")}
    {:else}
      {$page.error?.message}
    {/if}
  </p>
</Error>
