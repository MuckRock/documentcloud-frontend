<script lang="ts">
  import type { User } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import Dropdown, {
    type Placement,
  } from "$lib/components/common/Dropdown.svelte";

  import Portal from "$lib/components/layouts/Portal.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import {
    ChevronDown12,
    Gear16,
    Paperclip16,
    ChevronUp12,
    SignOut16,
  } from "svelte-octicons";
  import Menu from "$lib/components/common/Menu.svelte";
  import Mailkey from "./Mailkey.svelte";

  import { SQUARELET_BASE, SIGN_OUT_URL } from "@/config/config.js";
  import Avatar from "./Avatar.svelte";
  import { remToPx } from "@/lib/utils/layout";
  import { getUserName } from "@/lib/api/accounts";

  export let user: User;
  export let position: Placement = "bottom-end";

  let width: number;

  let mailkeyOpen = false;
  function setMailkeyOpen(open?: boolean) {
    mailkeyOpen = open ?? !mailkeyOpen;
  }
</script>

<svelte:window bind:innerWidth={width} />

<Dropdown {position}>
  <NavItem slot="anchor" title="Open Menu">
    <Avatar {user} slot="start" />
    {#if width > remToPx(48)}
      <span class="name">{getUserName(user)}</span>
    {/if}
    <div class="dropdownArrow" slot="end">
      {#if position.includes("bottom")}
        <ChevronDown12 />
      {:else}
        <ChevronUp12 />
      {/if}
    </div>
  </NavItem>
  <Menu slot="default" let:close>
    <NavItem href={SQUARELET_BASE} target="_blank" on:click={close}>
      <Gear16 slot="start" />
      {$_("authSection.user.acctSettings")}
    </NavItem>
    <NavItem
      hover
      on:click={() => {
        setMailkeyOpen(true);
        close();
      }}
    >
      <Paperclip16 slot="start" />
      {$_("authSection.user.uploadEmail")}
    </NavItem>
    <NavItem href={SIGN_OUT_URL} on:click={close}>
      <SignOut16 slot="start" />
      {$_("authSection.user.signOut")}
    </NavItem>
  </Menu>
</Dropdown>
{#if mailkeyOpen}
  <Portal>
    <Mailkey on:close={() => setMailkeyOpen(false)} />
  </Portal>
{/if}

<style>
  .dropdownArrow {
    display: flex;
    align-items: center;
  }
</style>
