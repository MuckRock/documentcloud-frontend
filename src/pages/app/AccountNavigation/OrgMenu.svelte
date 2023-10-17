<script lang="ts" context="module">
  export interface Org {
    id: string;
    name: string;
    avatar_url: string;
    individual: boolean;
  }

  type Maybe<T> = T | undefined;
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Dropdown from "../../../common/Dropdown.svelte";
  import Menu from "../../../common/Menu.svelte";
  import MenuItem from "../../../common/MenuItem.svelte";
  import MenuTitle from "../../../common/MenuTitle.svelte";

  export let activeOrg: Maybe<Org>;
  export let userOrgs: Org[];
  export let changeOrg: (org: Org) => void;
</script>

{#if activeOrg}
  <Dropdown name="organization" fixed={true}>
    <MenuTitle slot="title" label={activeOrg.name}>
      <img src={activeOrg.avatar_url} alt="" slot="icon" />
    </MenuTitle>
    <Menu>
      {#each userOrgs as org}
        <MenuItem
          on:click={() => changeOrg(org)}
          selected={org.id === activeOrg.id}
        >
          {org.name}
        </MenuItem>
      {/each}
    </Menu>
  </Dropdown>
{/if}
