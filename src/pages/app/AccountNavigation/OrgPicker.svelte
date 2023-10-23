<script lang="ts">
  import Dropdown, { closeDropdown } from "../../../common/Dropdown2.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import { Org } from "./types";
  import { Organization16 } from "svelte-octicons";
  import Loader from "../../../common/Loader.svelte";
  export let activeOrg: Org;
  export let loading = false;
  export let orgOptions: Org[] = [];
  export let handleChange: (id: string) => void = () => {};
</script>

<style>
  .container {
    position: sticky;
    bottom: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  .orgAvatar {
    height: 1.5rem;
    width: 1.5rem;
    display: block;
  }
  .orgIcon {
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .orgSelectLabel {
    font-size: 0.6875em;
    color: var(--gray);
    padding: 0 0.5rem;
  }
  .picker {
    padding: 0 0.5rem;
  }
</style>

<div class="container">
  <p class="orgSelectLabel">Switch organization</p>
  <div class="picker">
    <Dropdown id="orgSelect" border={true}>
      <MenuTitle slot="title" label={activeOrg.name}>
        <span slot="icon">
          {#if activeOrg.avatar_url}
            <img src={activeOrg.avatar_url} class="orgAvatar" alt="" />
          {:else}
            <div class="orgIcon"><Organization16 /></div>
          {/if}
        </span>
      </MenuTitle>
      <Menu>
        {#if loading}
          <Loader active center />
        {:else}
          {#each orgOptions as org}
            <MenuItem
              on:click={() => {
                closeDropdown("orgSelect");
                handleChange?.(org.id);
              }}
              selected={org.id === activeOrg.id}
            >
              {org.name}
            </MenuItem>
          {/each}
        {/if}
      </Menu>
    </Dropdown>
  </div>
</div>
