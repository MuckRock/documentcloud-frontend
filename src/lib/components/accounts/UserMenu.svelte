<script lang="ts">
  import { _ } from "svelte-i18n";
  import Dropdown, { closeDropdown } from "@/common/Dropdown2.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import type { User } from "@/api/types";
  import {
    ChevronDown16,
    Gear16,
    Paperclip16,
    SignOut16,
  } from "svelte-octicons";
  import Menu from "@/common/Menu.svelte";

  import {
    DC_BASE,
    DC_LOGIN,
    SQUARELET_BASE,
    SQUARELET_SIGNUP,
    DC_LOGOUT,
  } from "@/config/config.js";

  export const SQUARELET_URL = SQUARELET_BASE;
  export const SIGN_IN_URL = DC_BASE + DC_LOGIN;
  export const SIGN_UP_URL =
    SQUARELET_BASE +
    SQUARELET_SIGNUP +
    encodeURIComponent(window.location.href);
  export const SIGN_OUT_URL = DC_BASE + DC_LOGOUT;

  export let user: User;

  const dropdownId = "user-menu";
  function close() {
    closeDropdown(dropdownId);
  }
</script>

<Dropdown id={dropdownId} position="right">
  <SidebarItem slot="title">
    <img src={user.avatar_url} alt="Avatar" class="avatar" />
    <span class="name">{user.name}</span>
    <div class="dropdownArrow"><ChevronDown16 /></div>
  </SidebarItem>
  <Menu>
    <SidebarItem href={SQUARELET_URL} target="_blank" on:click={close}>
      <Gear16 />
      {$_("authSection.user.acctSettings")}
    </SidebarItem>
    <!-- TODO mailkey page -->
    <SidebarItem hover on:click={close}>
      <Paperclip16 />
      {$_("authSection.user.uploadEmail")}
    </SidebarItem>
    <SidebarItem href={SIGN_OUT_URL} on:click={close}>
      <SignOut16 />
      {$_("authSection.user.signOut")}
    </SidebarItem>
  </Menu>
</Dropdown>

<style>
  .avatar {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.75rem;
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
