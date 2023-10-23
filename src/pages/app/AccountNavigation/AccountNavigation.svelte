<script lang="ts">
  import { orgsAndUsers, changeActive } from "../../../manager/orgsAndUsers.js";

  import LanguageMenu from "./LanguageMenu.svelte";
  import HelpMenu from "./HelpMenu.svelte";
  import UserMenu from "./UserMenu.svelte";
  import OrgMenu from "./OrgMenu.svelte";
  import PremiumMenu from "./PremiumMenu.svelte";
  import { User, Org } from "./types";

  $: user = $orgsAndUsers.me as User;
  $: activeOrg = user.organization as Org;
  // TODO: include user plan information in payload
  // @ts-expect-error unimplemented "plan" property
  $: isPremium = user.organizations.length > 0 || user?.plan === "Professional";
</script>

<style>
  .account-navigation {
    box-sizing: border-box;
    width: 100%;
    font-size: 0.875em;
    display: flex;
    justify-content: space-between;
    padding: 1rem;
  }

  .account-navigation section {
    display: flex;
    gap: 1rem;
  }
</style>

<nav class="account-navigation">
  <section class="primary">
    {#if activeOrg && !activeOrg.individual}
      <OrgMenu {user} {activeOrg} />
    {:else}
      <PremiumMenu {isPremium} />
    {/if}
    <UserMenu {user} />
  </section>
  <section class="secondary">
    <LanguageMenu />
    <HelpMenu />
  </section>
</nav>
