<script lang="ts">
  import { page } from "$app/state";
  import { _ } from "svelte-i18n";
  import Error from "$lib/components/layouts/Error.svelte";
</script>

<Error status={page.status}>
  {#snippet message()}
    <p>
      {#if page.status === 404}
        {$_("notfound.content")}
      {:else}
        {page.error?.message}
      {/if}
    </p>
  {/snippet}
</Error>
