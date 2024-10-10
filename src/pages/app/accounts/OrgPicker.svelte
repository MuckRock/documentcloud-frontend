<script lang="ts">
  import { Organization16 } from "svelte-octicons";

  import Dropdown from "../../../lib/components/common/Dropdown.svelte";
  import Menu from "../../../lib/components/common/Menu.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";
  import MenuItem from "../../../lib/components/common/MenuItem.svelte";
  import Loader from "../../../common/Loader.svelte";

  import type { Org } from "../../../api/types/orgAndUser";

  export let activeOrg: Org;
  export let loading = false;
  export let orgOptions: Org[] = [];
  export let handleChange: (org: Org) => void = () => {};
</script>

<div class="container">
  <p class="orgSelectLabel">Switch organization</p>
  <div class="picker">
    <Dropdown border={true}>
      <MenuTitle slot="title" label={activeOrg.name}>
        <span slot="icon">
          {#if activeOrg.avatar_url}
            <img src={activeOrg.avatar_url} class="orgAvatar" alt="" />
          {:else}
            <div class="orgIcon"><Organization16 /></div>
          {/if}
        </span>
      </MenuTitle>
      <Menu let:close slot="default">
        {#if loading}
          <Loader active center />
        {:else}
          {#each orgOptions as org}
            <MenuItem
              on:click={() => {
                close();
                handleChange?.(org);
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

<style>
  .container {
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
    font-size: 0.875em;
    color: var(--gray);
    padding: 0 0.5rem;
  }
  .picker {
    padding: 0 0.5rem;
  }
</style>
