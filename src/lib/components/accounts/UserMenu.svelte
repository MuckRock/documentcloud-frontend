<script lang="ts">
  import type { User } from "@/api/types";

  import { _ } from "svelte-i18n";

  import Dropdown, {
    closeDropdown,
  } from "@/lib/components/common/Dropdown.svelte";
  import Mailkey from "./Mailkey.svelte";
  import Portal from "../layouts/Portal.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import {
    ChevronDown12,
    Gear16,
    Paperclip16,
    ChevronUp12,
    SignOut16,
  } from "svelte-octicons";
  import Menu from "$lib/components/common/Menu.svelte";

  import { SQUARELET_BASE, SIGN_OUT_URL } from "@/config/config.js";
  import Avatar from "./Avatar.svelte";
  import { remToPx } from "@/lib/utils/layout";
  import { getUserName } from "@/lib/api/accounts";

  export let user: User;
  export let position = "bottom right";

  let width: number;

  const dropdownId = "user-menu";
  function close() {
    closeDropdown(dropdownId);
  }

  let mailkeyOpen = false;
  function setMailkeyOpen(open?: boolean) {
    mailkeyOpen = open ?? !mailkeyOpen;
  }
</script>

<svelte:window bind:innerWidth={width} />

<Dropdown id={dropdownId} {position}>
  <SidebarItem slot="title" title="Open Menu">
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
  </SidebarItem>
  <Menu>
    <SidebarItem href={SQUARELET_BASE} target="_blank" on:click={close}>
      <Gear16 slot="start" />
      {$_("authSection.user.acctSettings")}
    </SidebarItem>
    <SidebarItem
      hover
      on:click={() => {
        setMailkeyOpen(true);
        close();
      }}
    >
      <Paperclip16 slot="start" />
      {$_("authSection.user.uploadEmail")}
    </SidebarItem>
    <SidebarItem href={SIGN_OUT_URL} on:click={close}>
      <SignOut16 slot="start" />
      {$_("authSection.user.signOut")}
    </SidebarItem>
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
