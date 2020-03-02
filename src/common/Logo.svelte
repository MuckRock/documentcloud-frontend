<script>
  import Link from "@/router/Link";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import { userUrl } from "@/search/search";

  // Svg assets
  import dcLogo from "@/assets/dc_logo.svg";
</script>

<style lang="scss">
  :global(.dclogo) {
    width: 166px;
    height: 29px;
    padding: 5px 25px 12px 25px;
    user-select: none;
  }

  @media only screen and (max-width: 600px) {
    :global(.dclogo) {
      padding: 10px 25px 40px 25px;
    }
  }
</style>

{#if $orgsAndUsers.me != null}
  <Link toUrl={userUrl($orgsAndUsers.me)}>
    {@html dcLogo}
  </Link>
{:else}
  <Link to="app">
    {@html dcLogo}
  </Link>
{/if}
