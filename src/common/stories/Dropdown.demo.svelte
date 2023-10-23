<script lang="ts">
  import Dropdown, { closeDropdown } from "../Dropdown2.svelte";
  import Menu from "../Menu.svelte";
  import MenuTitle from "../MenuTitle.svelte";
  import MenuItem from "../MenuItem.svelte";

  export let position: string;
  export let overlay: boolean;

  let options = ["Option 1", "Option 2", "Option 3"];
  let subOptions = ["Suboption A", "Suboption B", "Suboption C"];
</script>

<style>
  .content {
    border-radius: 3px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    padding: 0.5rem;
  }
</style>

<Dropdown {position} {overlay} id="dropdown-1">
  <MenuTitle label="Options" slot="title" />
  <Menu>
    {#each options as option}
      <MenuItem on:click={() => closeDropdown("dropdown-1")}>{option}</MenuItem>
    {/each}
    <Dropdown overlay={false} id="dropdown-1-1">
      <MenuTitle label="Option 4" slot="title" />
      <Menu>
        {#each subOptions as subOption}
          <MenuItem on:click={() => closeDropdown("dropdown-1-1")}
            >{subOption}</MenuItem
          >
        {/each}
      </Menu>
    </Dropdown>
  </Menu>
</Dropdown>

<Dropdown {position} {overlay} id="dropdown-2">
  <MenuTitle label="Content" slot="title" />
  <div class="content">
    <img
      class="contentImg"
      src="https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Placeholder"
      height="300"
      width="400"
    />
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dapibus id
      metus vel euismod. Phasellus luctus, orci sit amet vestibulum tincidunt,
      purus erat interdum ex, vel bibendum tortor justo sit amet lectus. Fusce
      consequat, ligula non viverra auctor, velit nulla elementum lectus, nec
      luctus felis libero a quam. In hac habitasse platea dictumst. Vivamus
      euismod, purus non tincidunt blandit, erat augue dapibus metus, et aliquam
      sapien elit ac orci. Integer ut justo nec justo vestibulum consectetur ut
      non nisi. Sed vestibulum eget tortor eget tristique. Nulla facilisi. Cras
      eget vehicula quam, id scelerisque ipsum. Nunc sagittis elit vitae justo
      viverra, at condimentum lectus tristique. Integer nec malesuada purus.
      Nullam eu bibendum libero.
    </p>
  </div>
</Dropdown>
