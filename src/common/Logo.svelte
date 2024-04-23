<script>
  import Link from "@/router/Link.svelte";
  import { orgsAndUsers } from "@/manager/orgsAndUsers.js";
  import { userUrl } from "@/search/search.js";
  import { getPath } from "@/router/router.js";

  // Svg assets
  import dcLogo from "@/assets/dc_logo.svg?raw";

  export let newPage = false;
  export let nopadding = false;
  export let homeLink = false;

  $: toUrl = homeLink
    ? getPath("default")
    : $orgsAndUsers.me != null
      ? userUrl($orgsAndUsers.me)
      : getPath("app");
</script>

{#if $orgsAndUsers.me !== null}
  <!-- TODO: some bug that requires this redundant if block -->
  <Link {newPage} inlineBlock={true} {toUrl}>
    <span class:nopadding>{@html dcLogo}</span>
  </Link>
{:else}
  <Link {newPage} inlineBlock={true} {toUrl}>
    <span class:nopadding>{@html dcLogo}</span>
  </Link>
{/if}

<style>
  :global(.dclogo) {
    width: auto;
    height: auto;
    user-select: none;
  }
</style>
