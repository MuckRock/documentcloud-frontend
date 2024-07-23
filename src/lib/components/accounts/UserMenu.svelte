<script lang="ts">
  import type { User } from "@/api/types";

  import { _ } from "svelte-i18n";

  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import Mailkey from "./Mailkey.svelte";
  import Portal from "../layouts/Portal.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import {
    ChevronDown16,
    Gear16,
    Paperclip16,
    Person16,
    SignOut16,
  } from "svelte-octicons";
  import Menu from "@/common/Menu.svelte";

  import { SQUARELET_BASE, SIGN_OUT_URL } from "@/config/config.js";

  export let user: User;

  const dropdownId = "user-menu";
  function close() {
    closeDropdown(dropdownId);
  }

  let mailkeyOpen = false;
  function setMailkeyOpen(open?: boolean) {
    mailkeyOpen = open ?? !mailkeyOpen;
  }
</script>

<Dropdown id={dropdownId} position="right">
  <SidebarItem slot="title" title="Open Menu">
    <div class="avatar">
      {#if user.avatar_url}
        <img src={user.avatar_url} alt="Avatar" />
      {:else}
        <Person16 fill="var(--gray-4)" />
      {/if}
    </div>
    <span class="name">{user.name ?? user.username}</span>
    <div class="dropdownArrow"><ChevronDown16 /></div>
  </SidebarItem>
  <Menu>
    <SidebarItem href={SQUARELET_BASE} target="_blank" on:click={close}>
      <Gear16 />
      {$_("authSection.user.acctSettings")}
    </SidebarItem>
    <SidebarItem hover on:click={() => {
      setMailkeyOpen(true);
      close();
    }}>
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
  .avatar {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.75rem;
    background: var(--gray-2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .avatar > img {
    height: 100%;
    width: 100%;
  }

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
