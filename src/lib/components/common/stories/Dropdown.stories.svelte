<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import { ChevronDown12, ChevronRight12, Globe16 } from "svelte-octicons";

  export const meta = {
    title: "Common / Dropdown",
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
    <NavItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </NavItem>
    <Menu slot="inner" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="With Border">
  <Dropdown border>
    <NavItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </NavItem>
    <Menu slot="inner" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="With Overlay">
  <Dropdown overlay>
    <NavItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronDown12 slot="end" />
    </NavItem>
    <Menu slot="inner" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="Right Position">
  <Dropdown position="right">
    <NavItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronRight12 slot="end" />
    </NavItem>
    <Menu slot="inner" let:close>
      <MenuItem on:click={close}>Item 1</MenuItem>
      <MenuItem on:click={close}>Item 2</MenuItem>
      <MenuItem on:click={close}>Item 3</MenuItem>
    </Menu>
  </Dropdown>
</Story>

<Story name="With Nested Dropdown">
  <Dropdown position="right">
    <NavItem slot="anchor">
      <Globe16 slot="start" />
      Open Dropdown
      <ChevronRight12 slot="end" />
    </NavItem>
    <Menu slot="inner" let:close>
      <NavItem on:click={close}>Item 1</NavItem>
      <NavItem on:click={close}>Item 2</NavItem>
      <Dropdown position="right">
        <NavItem slot="anchor">
          Item 3
          <ChevronRight12 slot="end" />
        </NavItem>
        <Menu slot="inner">
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </Menu>
      </Dropdown>
    </Menu>
  </Dropdown>
</Story>

<Story name="Multiple Dropdowns">
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      <NavItem slot="anchor">
        <Globe16 slot="start" />
        First Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
      <Menu slot="inner" let:close>
        <MenuItem on:click={close}>First Item 1</MenuItem>
        <MenuItem on:click={close}>First Item 2</MenuItem>
        <MenuItem on:click={close}>First Item 3</MenuItem>
      </Menu>
    </Dropdown>

    <Dropdown>
      <NavItem slot="anchor">
        <Globe16 slot="start" />
        Second Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
      <Menu slot="inner" let:close>
        <MenuItem on:click={close}>Second Item 1</MenuItem>
        <MenuItem on:click={close}>Second Item 2</MenuItem>
        <MenuItem on:click={close}>Second Item 3</MenuItem>
      </Menu>
    </Dropdown>

    <Dropdown border>
      <NavItem slot="anchor">
        <Globe16 slot="start" />
        Third Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
      <Menu slot="inner" let:close>
        <MenuItem on:click={close}>Third Item 1</MenuItem>
        <MenuItem on:click={close}>Third Item 2</MenuItem>
        <MenuItem on:click={close}>Third Item 3</MenuItem>
      </Menu>
    </Dropdown>
  </div>
</Story>

<Story name="Sibling Dropdowns With Nested">
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      <NavItem slot="anchor">
        <Globe16 slot="start" />
        Simple Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
      <Menu slot="inner" let:close>
        <MenuItem on:click={close}>Item 1</MenuItem>
        <MenuItem on:click={close}>Item 2</MenuItem>
        <MenuItem on:click={close}>Item 3</MenuItem>
      </Menu>
    </Dropdown>

    <Dropdown position="bottom-start">
      <NavItem slot="anchor">
        <Globe16 slot="start" />
        Dropdown With Nested
        <ChevronDown12 slot="end" />
      </NavItem>
      <Menu slot="inner" let:close>
        <MenuItem on:click={close}>Item 1</MenuItem>
        <MenuItem on:click={close}>Item 2</MenuItem>
        <Dropdown position="right">
          <NavItem slot="anchor">
            Nested Item
            <ChevronRight12 slot="end" />
          </NavItem>
          <Menu slot="inner">
            <MenuItem>Nested Item 1</MenuItem>
            <MenuItem>Nested Item 2</MenuItem>
            <MenuItem>Nested Item 3</MenuItem>
          </Menu>
        </Dropdown>
        <MenuItem on:click={close}>Item 4</MenuItem>
      </Menu>
    </Dropdown>
  </div>
</Story>
