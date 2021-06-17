<script>
  import Link from "@/router/Link";
  import FlatPage from "./FlatPage";
  import { router } from "@/router/router";
  import { onMount } from "svelte";
  import { getContent } from "@/api/cms";
  import { _ } from "svelte-i18n";

  export let title = "Page not found";
  export let message = "Please try another URL";

  let notFound = false;
  let content = null;

  onMount(async () => {
    if (router.resolvedRoute.name != null) {
      // Don't try to fetch flat page if it should resolve to a route
      notFound = true;
      return;
    }
    try {
      content = await getContent(router.currentUrl);
      if (content == null || content.trim().length == 0) {
        // Show not found if content is invalid
        notFound = true;
      }
    } catch (e) {
      console.error(e);
      // Show 404
      notFound = true;
    }
  });
</script>

<style lang="scss">
  .notfound {
    padding: 2em;

    :global(a) {
      color: $primary;
    }
  }
</style>

{#if notFound}
  <div class="notfound">
    <p>
      <Link to="default">{$_("common.home")}</Link>
    </p>

    <h1>{title}</h1>

    <div>{message}</div>

    <slot />
  </div>
{:else if content != null}
  <FlatPage {content} />
{/if}
