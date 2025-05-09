<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Flatpage, Org, User } from "$lib/api/types";

  import { page } from "$app/stores";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import Breadcrumbs from "../navigation/Breadcrumbs.svelte";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import HelpMenu from "../navigation/HelpMenu.svelte";
  import OrgMenu from "../navigation/OrgMenu.svelte";
  import LanguageMenu from "../navigation/LanguageMenu.svelte";
  import SignedIn from "../common/SignedIn.svelte";
  import TipOfDay from "../common/TipOfDay.svelte";
  import UserMenu from "../accounts/UserMenu.svelte";

  import ProcessDropdown from "$lib/components/processing/ProcessDropdown.svelte";
  import Portal from "./Portal.svelte";
  import Modal from "./Modal.svelte";
  import UserFeedback from "../forms/UserFeedback.svelte";

  import { APP_URL, SIGN_IN_URL } from "@/config/config";
  import { remToPx } from "@/lib/utils/layout";
  import { inMyOrg } from "$lib/api/accounts";
  import { getCurrentUser } from "$lib/utils/permissions";

  const me = getCurrentUser();
  const org = getContext<Writable<Org>>("org");
  const tipOfDay = getContext<Flatpage>("tipOfDay");
  const user_orgs = getContext<Writable<Promise<Org[]>>>("user_orgs");
  const org_users = getContext<Writable<Promise<User[]>>>("org_users");

  let feedbackOpen = false;
  let width: number;

  $: BREAKPOINTS = {
    BOTTOM_NAV: width < remToPx(36),
  };

  $: sign_in_url = new URL(`?next=${APP_URL}`, SIGN_IN_URL);
</script>

{#if tipOfDay}<TipOfDay message={tipOfDay.content} />{/if}
<nav bind:clientWidth={width}>
  <div class="inner">
    <slot name="breadcrumbs">
      <Breadcrumbs trail={$page.data.breadcrumbs} />
    </slot>
    <ProcessDropdown />
    {#if !BREAKPOINTS.BOTTOM_NAV}
      <SignedIn>
        {#if $me}
          <Flex>
            {#await Promise.all([$user_orgs, $org_users]) then [orgs, users]}
              <OrgMenu
                active_org={$org}
                {orgs}
                users={inMyOrg($org.id, $me.id, users)}
              />
            {/await}
            <UserMenu user={$me} />
          </Flex>
        {/if}
        <Button slot="signedOut" mode="primary" href={sign_in_url.href}>
          {$_("authSection.user.signIn")}
        </Button>
      </SignedIn>
      <LanguageMenu />
      <HelpMenu />
    {/if}

    <SignedIn>
      <Button
        minW={false}
        ghost
        mode="primary"
        on:click={() => (feedbackOpen = true)}
        id="feedback"
      >
        {$_("common.feedback")}
      </Button>
    </SignedIn>

    {#if feedbackOpen}
      <Portal>
        <Modal on:close={() => (feedbackOpen = false)}>
          <h1 slot="title">{$_("feedback.title")}</h1>
          <UserFeedback user={$me} on:close={() => (feedbackOpen = false)} />
        </Modal>
      </Portal>
    {/if}
  </div>
</nav>
<slot />
{#if BREAKPOINTS.BOTTOM_NAV}
  <nav class="bottom-nav">
    <SignedIn>
      {#if $me}
        <Flex>
          {#await Promise.all([$user_orgs, $org_users]) then [orgs, users]}
            <OrgMenu position="top-start" active_org={$org} {orgs} {users} />
          {/await}
          <UserMenu position="top-start" user={$me} />
        </Flex>
      {/if}
      <Button slot="signedOut" mode="primary" href={SIGN_IN_URL}>
        {$_("authSection.user.signIn")}
      </Button>
    </SignedIn>
    <Flex>
      <LanguageMenu position="top-end" />
      <HelpMenu position="top-end" />
    </Flex>
  </nav>
{/if}

<style>
  nav {
    display: flex;
    justify-content: center;
    background: var(--white, #ffffff);
    border-bottom: 1px solid var(--gray-1, #d8dee2);
    flex: 0 0 auto;
    box-shadow: var(--shadow-1);
    z-index: var(--z-navigation);
  }
  .inner {
    width: 100%;
    max-width: var(--app-max-w, 100rem);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 1rem;
  }
  .bottom-nav {
    position: sticky;
    bottom: 0;
    padding: 0.375rem 1rem;
    justify-content: space-between;
  }
  @media (max-width: 32rem) {
    .inner,
    .bottom-nav {
      padding: 0.375rem 0.5rem;
    }
  }
</style>
