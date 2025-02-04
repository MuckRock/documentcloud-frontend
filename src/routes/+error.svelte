<script lang="ts">
  import { page } from "$app/stores";
  import { _ } from "svelte-i18n";
  import Error from "$lib/components/layouts/Error.svelte";
  import { getCurrentUser } from "@/lib/utils/permissions";
  import { SIGN_IN_URL } from "@/config/config";

  const me = getCurrentUser();

  $: sign_in_url = new URL(`?next=${$page.url.href}`, SIGN_IN_URL);
</script>

<Error>
  <h1 slot="status">
    {$page.status}
  </h1>

  <div slot="message">
    {#if $page.status === 404}
      <p>{$_("notfound.content")}</p>
      {#if !me}
        <p class="signInMessage">
          {@html $_("error.signIn", { values: { href: sign_in_url.href } })}
        </p>
      {/if}
    {:else}
      <p>{$page.error?.message}</p>
    {/if}
  </div>
</Error>
