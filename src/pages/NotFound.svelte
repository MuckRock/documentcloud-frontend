<script>
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Link from "../router/Link.svelte";
  import FlatPage from "./FlatPage.svelte";

  import { router } from "../router/router.js";
  import { baseApiUrl } from "../api/base.js";

  export let title = "";
  export let content = "";
  export let message = "";

  let notFound = false;
  let loading;

  $: endpoint = getEndpoint($router.currentUrl);

  function getEndpoint(currentUrl) {
    const url = new URL("/api/flatpages" + currentUrl, baseApiUrl);

    if (!url.pathname.endsWith("/")) {
      url.pathname += "/";
    }

    return url;
  }

  async function load() {
    const resp = await fetch(endpoint, {
      credentials: "include",
    });

    if (!resp.ok) {
      notFound = true;
      return;
    }

    const data = await resp.json();

    title = data.title;
    content = data.content;
  }

  onMount(async () => {
    if (router.resolvedRoute.name) {
      // Don't try to fetch flat page if it should resolve to a route
      notFound = true;
      return;
    }

    loading = load();
  });
</script>

{#await loading then done}
  {#if notFound}
    <div class="notfound">
      <p>
        <Link to="default">{$_("common.home")}</Link>
      </p>

      <h1>{title || $_("notfound.title")}</h1>

      <div>
        <p>{message || $_("notfound.content")}</p>
      </div>

      <slot />
    </div>
  {:else}
    <FlatPage {title} {content} />
  {/if}
{/await}

<style>
  .notfound {
    padding: 2em;
  }
  .notfound :global(a) {
    color: var(--primary, #4294f0);
  }
</style>
