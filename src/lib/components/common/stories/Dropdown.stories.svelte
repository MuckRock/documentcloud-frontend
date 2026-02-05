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
    {#snippet anchor()}
      <NavItem>
        <Globe16 slot="start" />
        Open Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <MenuItem onclick={close}>Item 1</MenuItem>
        <MenuItem onclick={close}>Item 2</MenuItem>
        <MenuItem onclick={close}>Item 3</MenuItem>
      </Menu>
    {/snippet}
  </Dropdown>
</Story>

<Story name="With Border">
  <Dropdown border>
    {#snippet anchor()}
      <NavItem>
        <Globe16 slot="start" />
        Open Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <MenuItem onclick={close}>Item 1</MenuItem>
        <MenuItem onclick={close}>Item 2</MenuItem>
        <MenuItem onclick={close}>Item 3</MenuItem>
      </Menu>
    {/snippet}
  </Dropdown>
</Story>

<Story name="With Overlay">
  <Dropdown overlay>
    {#snippet anchor()}
      <NavItem>
        <Globe16 slot="start" />
        Open Dropdown
        <ChevronDown12 slot="end" />
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <MenuItem onclick={close}>Item 1</MenuItem>
        <MenuItem onclick={close}>Item 2</MenuItem>
        <MenuItem onclick={close}>Item 3</MenuItem>
      </Menu>
    {/snippet}
  </Dropdown>
</Story>

<Story name="Right Position">
  <Dropdown position="right">
    {#snippet anchor()}
      <NavItem>
        <Globe16 slot="start" />
        Open Dropdown
        <ChevronRight12 slot="end" />
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <MenuItem onclick={close}>Item 1</MenuItem>
        <MenuItem onclick={close}>Item 2</MenuItem>
        <MenuItem onclick={close}>Item 3</MenuItem>
      </Menu>
    {/snippet}
  </Dropdown>
</Story>

<Story name="With Nested Dropdown">
  <Dropdown position="right">
    {#snippet anchor()}
      <NavItem>
        <Globe16 slot="start" />
        Open Dropdown
        <ChevronRight12 slot="end" />
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <NavItem on:click={close}>Item 1</NavItem>
        <NavItem on:click={close}>Item 2</NavItem>
        <Dropdown position="right">
          {#snippet anchor()}
            <NavItem>
              Item 3
              <ChevronRight12 slot="end" />
            </NavItem>
          {/snippet}
          {#snippet inner()}
            <Menu>
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
            </Menu>
          {/snippet}
        </Dropdown>
      </Menu>
    {/snippet}
  </Dropdown>
</Story>

<Story name="Multiple Dropdowns">
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      {#snippet anchor()}
        <NavItem>
          <Globe16 slot="start" />
          First Dropdown
          <ChevronDown12 slot="end" />
        </NavItem>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem onclick={close}>First Item 1</MenuItem>
          <MenuItem onclick={close}>First Item 2</MenuItem>
          <MenuItem onclick={close}>First Item 3</MenuItem>
        </Menu>
      {/snippet}
    </Dropdown>

    <Dropdown>
      {#snippet anchor()}
        <NavItem>
          <Globe16 slot="start" />
          Second Dropdown
          <ChevronDown12 slot="end" />
        </NavItem>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem onclick={close}>Second Item 1</MenuItem>
          <MenuItem onclick={close}>Second Item 2</MenuItem>
          <MenuItem onclick={close}>Second Item 3</MenuItem>
        </Menu>
      {/snippet}
    </Dropdown>

    <Dropdown border>
      {#snippet anchor()}
        <NavItem>
          <Globe16 slot="start" />
          Third Dropdown
          <ChevronDown12 slot="end" />
        </NavItem>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem onclick={close}>Third Item 1</MenuItem>
          <MenuItem onclick={close}>Third Item 2</MenuItem>
          <MenuItem onclick={close}>Third Item 3</MenuItem>
        </Menu>
      {/snippet}
    </Dropdown>
  </div>
</Story>

<Story name="Sibling Dropdowns With Nested">
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      {#snippet anchor()}
        <NavItem>
          <Globe16 slot="start" />
          Simple Dropdown
          <ChevronDown12 slot="end" />
        </NavItem>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem onclick={close}>Item 1</MenuItem>
          <MenuItem onclick={close}>Item 2</MenuItem>
          <MenuItem onclick={close}>Item 3</MenuItem>
        </Menu>
      {/snippet}
    </Dropdown>

    <Dropdown position="bottom-start">
      {#snippet anchor()}
        <NavItem>
          <Globe16 slot="start" />
          Dropdown With Nested
          <ChevronDown12 slot="end" />
        </NavItem>
      {/snippet}
      {#snippet inner({ close })}
        <Menu>
          <MenuItem onclick={close}>Item 1</MenuItem>
          <MenuItem onclick={close}>Item 2</MenuItem>
          <Dropdown position="right">
            {#snippet anchor()}
              <NavItem>
                Nested Item
                <ChevronRight12 slot="end" />
              </NavItem>
            {/snippet}
            {#snippet inner()}
              <Menu>
                <MenuItem>Nested Item 1</MenuItem>
                <MenuItem>Nested Item 2</MenuItem>
                <MenuItem>Nested Item 3</MenuItem>
              </Menu>
            {/snippet}
          </Dropdown>
          <MenuItem onclick={close}>Item 4</MenuItem>
        </Menu>
      {/snippet}
    </Dropdown>
  </div>
</Story>
