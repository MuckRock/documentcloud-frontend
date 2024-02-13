<script lang="ts">
  import { getMe, getOrganization } from "../../../api/orgAndUser.js";

  import LanguageMenu from "./LanguageMenu.svelte";
  import HelpMenu from "./HelpMenu.svelte";
  import UserMenu from "./UserMenu.svelte";
  import OrgMenu from "./OrgMenu.svelte";
  import { type User, type Org, isOrg } from "../../../api/types/orgAndUser";

  let user: User | null = null;
  let org: Org | null = null;

  async function getUser() {
    try {
      user = await getMe();
      const activeOrg = user?.organization;
      if (!isOrg(activeOrg)) {
        org = await getOrganization(activeOrg);
      } else {
        org = activeOrg;
      }
    } catch (e) {
      user = null;
    }
  }

  const getUserPromise = getUser();
</script>

<nav class="account-navigation">
  <section class="primary">
    {#await getUserPromise then}
      <UserMenu {user} />
      {#if user}
        <OrgMenu {user} {org} />
      {/if}
    {/await}
  </section>
  <section class="secondary">
    <LanguageMenu />
    <HelpMenu />
  </section>
</nav>

<style>
  .account-navigation {
    box-sizing: border-box;
    width: 100%;
    font-size: 0.875em;
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .account-navigation section {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>
