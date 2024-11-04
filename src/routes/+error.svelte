<script lang="ts">
  import { page } from "$app/stores";
  import { _ } from "svelte-i18n";
  import Error from "$lib/components/layouts/Error.svelte";
</script>

<Error>
  <h1 slot="status">
    {$page.status}
  </h1>

  <p slot="message">
    {#if $page.status === 404}
      {$_("notfound.content")}
    {:else}
      {$page.error?.message}
    {/if}
  </p>
</Error>
