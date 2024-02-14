<script>
  import { _ } from "svelte-i18n";
  import { page } from "$app/stores";
</script>

{#if $page.status === 404}
  <h1>{$_("notfound.title")}</h1>
  <div>
    <p>{$_("notfound.content")}</p>
  </div>
{:else}
  <h1>{$page.status}: {$page.error.message}</h1>
{/if}
