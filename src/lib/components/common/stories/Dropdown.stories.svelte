<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import SidebarItem from "$lib/components/sidebar/SidebarItem.svelte";
  import { ChevronDown12, ChevronRight12, Globe16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Common / Dropdown",
    component: Dropdown,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    mode: "normal",
  };
</script>

<Story name="Basic">
  <Dropdown>
    <SidebarItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </SidebarItem>
    <Menu slot="default" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="With Border">
  <Dropdown border>
    <SidebarItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </SidebarItem>
    <Menu slot="default" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="With Overlay">
  <Dropdown overlay>
    <SidebarItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </SidebarItem>
    <Menu slot="default" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="Right Position">
  <Dropdown position="right">
    <SidebarItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronRight12 slot="end" />
    </SidebarItem>
    <Menu slot="default" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>
