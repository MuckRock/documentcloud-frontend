<script lang="ts">
  import type { User } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";

  import Avatar from "./Avatar.svelte";
  import Portal from "$lib/components/layouts/Portal.svelte";
  import Mailkey from "./Mailkey.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import {
    ChevronDown12,
    ChevronUp12,
    Gear16,
    Paperclip16,
    SignOut16,
  } from "svelte-octicons";
  import Menu from "$lib/components/common/Menu.svelte";

  import { SQUARELET_BASE, SIGN_OUT_URL } from "@/config/config.js";
  import { remToPx } from "$lib/utils/layout";
  import { getUserName } from "$lib/api/accounts";

  interface Props {
    user: User;
    position?: Placement;
  }

  let { user, position = "bottom-end" }: Props = $props();

  let mailkeyOpen = $state(false);
  let width: number | undefined = $state();
</script>

<svelte:window bind:innerWidth={width} />

<Dropdown {position}>
  {#snippet anchor()}
    <NavItem title="Open Menu">
      {#snippet start()}
        <Avatar {user} />
      {/snippet}
      {#if width && width > remToPx(48)}
        <span class="name">{getUserName(user)}</span>
      {/if}
      {#snippet end()}
        <div class="dropdownArrow">
          {#if position.includes("bottom")}
            <ChevronDown12 />
          {:else}
            <ChevronUp12 />
          {/if}
        </div>
      {/snippet}
    </NavItem>
  {/snippet}
  {#snippet inner({ close })}
    <Menu>
      <NavItem href={SQUARELET_BASE} target="_blank" onclick={(e) => close?.()}>
        {#snippet start()}
          <Gear16 />
        {/snippet}
        {$_("authSection.user.acctSettings")}
      </NavItem>
      <NavItem
        hover
        onclick={() => {
          mailkeyOpen = true;
          close?.();
        }}
      >
        {#snippet start()}
          <Paperclip16 />
        {/snippet}
        {$_("authSection.user.uploadEmail")}
      </NavItem>
      <NavItem href={SIGN_OUT_URL} onclick={(e) => close?.()}>
        {#snippet start()}
          <SignOut16 />
        {/snippet}
        {$_("authSection.user.signOut")}
      </NavItem>
    </Menu>
  {/snippet}
</Dropdown>

{#if mailkeyOpen}
  <Portal>
    <Mailkey onclose={() => (mailkeyOpen = false)} />
  </Portal>
{/if}

<style>
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
