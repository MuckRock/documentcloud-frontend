<script lang="ts">
  import type { User } from "@/api/types";

  import { _ } from "svelte-i18n";

  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
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
  import Menu from "@/common/Menu.svelte";

  import { SQUARELET_BASE, SIGN_OUT_URL } from "@/config/config.js";
  import Avatar from "./Avatar.svelte";

  export let user: User;
  export let position = "bottom right";

  const dropdownId = "user-menu";
  function close() {
    closeDropdown(dropdownId);
  }

  let mailkeyOpen = false;
  function setMailkeyOpen(open?: boolean) {
    mailkeyOpen = open ?? !mailkeyOpen;
  }
</script>

<Dropdown id={dropdownId} {position}>
  <SidebarItem slot="title" title="Open Menu">
    <Avatar {user} />
    <span class="name">{user.name ?? user.username}</span>
    <div class="dropdownArrow">
      {#if position.includes("bottom")}
        <ChevronDown12 />
      {:else}
        <ChevronUp12 />
      {/if}
    </div>
  </SidebarItem>
  <Menu>
    <SidebarItem href={SQUARELET_BASE} target="_blank" on:click={close}>
      <Gear16 />
      {$_("authSection.user.acctSettings")}
    </SidebarItem>
    <SidebarItem
      hover
      on:click={() => {
        setMailkeyOpen(true);
        close();
      }}
    >
      <Paperclip16 />
      {$_("authSection.user.uploadEmail")}
    </SidebarItem>
    <SidebarItem href={SIGN_OUT_URL} on:click={close}>
      <SignOut16 />
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

  @media (max-width: 64rem) {
    .name {
      display: none;
    }
  }
</style>
