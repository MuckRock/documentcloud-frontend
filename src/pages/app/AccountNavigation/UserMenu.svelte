<script lang="ts" context="module">
  export interface User {
    name: string;
    avatar_url: string;
  }

  type Maybe<T> = T | undefined;
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  import {
    SQUARELET_URL,
    SIGN_IN_URL,
    SIGN_OUT_URL,
  } from "../../../api/auth.js";
  import { showMailkeySelected } from "../../../manager/manager.js";

  export let user: Maybe<User>;
</script>

<style>
  .userIcon {
    height: 1.5rem;
    width: 1.5rem;
    display: block;
  }
</style>

{#if user}
  <Dropdown name="user" fixed={true}>
    <MenuTitle slot="title" label={user.name}>
      <img src={user.avatar_url} class="userIcon" alt="" slot="icon" />
    </MenuTitle>
    <Menu>
      <a href={SQUARELET_URL} target="_blank" style="color: inherit">
        <MenuItem>{$_("authSection.acctSettings")}</MenuItem>
      </a>
      <MenuItem on:click={showMailkeySelected}>
        {$_("authSection.uploadEmail")}
      </MenuItem>
      <a href={SIGN_OUT_URL} style="color: inherit">
        <MenuItem>{$_("authSection.signOut")}</MenuItem>
      </a>
    </Menu>
  </Dropdown>
{:else}
  <a href={SIGN_IN_URL}>{$_("authSection.signIn")}</a>
{/if}
