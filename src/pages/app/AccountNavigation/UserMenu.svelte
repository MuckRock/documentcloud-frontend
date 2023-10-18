<script lang="ts" context="module">
  type Maybe<T> = T | undefined | null;

  export interface User {
    id: string;
    name: Maybe<string>;
    avatar_url: Maybe<string>;
    username: string;
    organizations: string[];
    admin_organizations: string[];
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import { Paperclip16, Gear16, SignOut16, Person16 } from "svelte-octicons";

  import {
    SQUARELET_URL,
    SIGN_IN_URL,
    SIGN_OUT_URL,
  } from "../../../api/auth.js";
  import { showMailkeySelected } from "../../../manager/manager.js";

  export let user: Maybe<User>;
</script>

<style>
  .userAvatar {
    height: 1.5rem;
    width: 1.5rem;
    display: block;
  }
  .userIcon {
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

{#if user}
  <Dropdown name="user" fixed={true}>
    <MenuTitle slot="title" label={user.name ?? user.username}>
      <span slot="icon">
        {#if user.avatar_url}
          <img src={user.avatar_url} class="userAvatar" alt="" />
        {:else}
          <div class="userIcon"><Person16 /></div>
        {/if}
      </span>
    </MenuTitle>
    <Menu>
      <MenuItem href={SQUARELET_URL} target="_blank">
        <Gear16 slot="icon" />
        {$_("authSection.user.acctSettings")}
      </MenuItem>
      <MenuItem on:click={showMailkeySelected}>
        <Paperclip16 slot="icon" />
        {$_("authSection.user.uploadEmail")}
      </MenuItem>
      <MenuItem href={SIGN_OUT_URL}>
        <SignOut16 slot="icon" />
        {$_("authSection.user.signOut")}
      </MenuItem>
    </Menu>
  </Dropdown>
{:else}
  <a href={SIGN_IN_URL}>{$_("authSection.user.signIn")}</a>
{/if}
