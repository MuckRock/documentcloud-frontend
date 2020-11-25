<script>
  import Link from "@/router/Link";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { userUrl } from "@/search/search";
  import { getPath } from "@/router/router";

  // Svg assets
  import dcLogo from "@/assets/dc_logo.svg";

  export let newPage = false;
  export let nopadding = false;
  export let homeLink = false;

  $: toUrl = homeLink
    ? getPath("default")
    : $orgsAndUsers.me != null
    ? userUrl($orgsAndUsers.me)
    : getPath("app");
</script>

<style lang="scss">
  :global(.dclogo) {
    width: 166px;
    height: 29px;
    padding: 5px 25px 12px 25px;
    user-select: none;

    @media screen and (max-width: $mobileBreak) {
      padding-left: 25px + $sidebarAdd !important;
    }
  }

  .nopadding {
    :global(.dclogo) {
      padding: 0 !important;
    }
  }

  @media only screen and (max-width: $mobileBreak) {
    :global(.dclogo) {
      padding: 10px 25px 40px 25px;
    }
  }
</style>

{#if $orgsAndUsers.me != null}
  <!-- TODO: some bug that requires this redundant if block -->
  <Link {newPage} inlineBlock={true} {toUrl}>
    <span class:nopadding>{@html dcLogo}</span>
  </Link>
{:else}
  <Link {newPage} inlineBlock={true} {toUrl}>
    <span class:nopadding>{@html dcLogo}</span>
  </Link>
{/if}
