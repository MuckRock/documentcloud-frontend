<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Writable } from "svelte/store";
  import { page } from "$app/stores";
  import type { Flatpage, Org, User } from "$lib/api/types";
  import { getContext } from "svelte";
  import SignedIn from "../common/SignedIn.svelte";
  import TipOfDay from "../common/TipOfDay.svelte";
  import Breadcrumbs from "../navigation/Breadcrumbs.svelte";
  import Flex from "../common/Flex.svelte";
  import OrgMenu from "../navigation/OrgMenu.svelte";
  import UserMenu from "../accounts/UserMenu.svelte";
  import Button from "../common/Button.svelte";
  import LanguageMenu from "../navigation/LanguageMenu.svelte";
  import HelpMenu from "../navigation/HelpMenu.svelte";
  import { SIGN_IN_URL } from "@/config/config";
  import Portal from "./Portal.svelte";
  import Modal from "./Modal.svelte";
  import UserFeedback from "../forms/UserFeedback.svelte";
  import { remToPx } from "@/lib/utils/layout";
  import { Megaphone16 } from "svelte-octicons";

  const me = getContext<Writable<User>>("me");
  const org = getContext<Writable<Org>>("org");
  const tipOfDay = getContext<Flatpage>("tipOfDay");
  const user_orgs = getContext<Writable<Promise<Org[]>>>("user_orgs");
  const org_users = getContext<Writable<Promise<User[]>>>("org_users");

  let feedbackOpen = false;
  let width: number;
  $: BREAKPOINTS = {
    BOTTOM_NAV: width < remToPx(36),
  };
</script>

{#if tipOfDay}<TipOfDay message={tipOfDay.content} />{/if}
<nav bind:clientWidth={width}>
  <div class="inner">
    <slot name="breadcrumbs">
      <Breadcrumbs trail={$page.data.breadcrumbs} />
    </slot>
    {#if !BREAKPOINTS.BOTTOM_NAV}
      <SignedIn>
        <Flex>
          {#await Promise.all([$user_orgs, $org_users]) then [orgs, users]}
            <OrgMenu active_org={$org} {orgs} {users} />
          {/await}
          <UserMenu user={$me} />
        </Flex>
        <Button slot="signedOut" mode="primary" href={SIGN_IN_URL}>
          {$_("authSection.user.signIn")}
        </Button>
      </SignedIn>
      <LanguageMenu />
      <HelpMenu />
    {/if}

    <Button
      minW={false}
      ghost
      mode="primary"
      on:click={() => (feedbackOpen = true)}
    >
      Feedback
    </Button>

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
      <Flex>
        {#await Promise.all([$user_orgs, $org_users]) then [orgs, users]}
          <OrgMenu position="top left" active_org={$org} {orgs} {users} />
        {/await}
        <UserMenu position="top left" user={$me} />
      </Flex>
      <Button slot="signedOut" mode="primary" href={SIGN_IN_URL}>
        {$_("authSection.user.signIn")}
      </Button>
    </SignedIn>
    <Flex>
      <LanguageMenu position="top right" />
      <HelpMenu position="top right" />
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
