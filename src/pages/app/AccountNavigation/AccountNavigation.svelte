<script lang="ts">
  import { orgsAndUsers, changeActive } from "../../../manager/orgsAndUsers.js";

  import LanguageMenu from "./LanguageMenu.svelte";
  import HelpMenu from "./HelpMenu.svelte";
  import UserMenu from "./UserMenu.svelte";
  import OrgMenu from "./OrgMenu.svelte";
  import PremiumMenu from "./PremiumMenu.svelte";

  $: user = $orgsAndUsers.me;
  $: orgs = $orgsAndUsers.selfOrgs?.filter((org) => !org?.individual) ?? [];
  $: currentOrg = user?.organization;
  // TODO: include user plan information in payload
  $: isPremium = orgs.length > 0 || user?.plan === "Professional";

  async function change(org) {
    await changeActive(org);
  }
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
    {#if currentOrg && !currentOrg.individual}
      <OrgMenu activeOrg={currentOrg} userOrgs={orgs} changeOrg={change} />
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
