<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Menu from "$lib/components/common/Menu.svelte";
  import MenuItem from "$lib/components/common/MenuItem.svelte";
  import Dropdown from "$lib/components/common/Dropdown.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import { ChevronDown12, ChevronRight12, Globe16 } from "svelte-octicons";

  const { Story } = defineMeta({
    title: "Common / Dropdown",
    component: Dropdown,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });
</script>

<Story name="Basic" asChild>
  <Dropdown>
    {#snippet anchor()}
      <NavItem>
        {#snippet start()}
          <Globe16 />
        {/snippet}
        Open Dropdown
        {#snippet end()}
          <ChevronDown12 />
        {/snippet}
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

<Story name="With Border" asChild>
  <Dropdown border>
    {#snippet anchor()}
      <NavItem>
        {#snippet start()}
          <Globe16 />
        {/snippet}
        Open Dropdown
        {#snippet end()}
          <ChevronDown12 />
        {/snippet}
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

<Story name="With Overlay" asChild>
  <Dropdown overlay>
    {#snippet anchor()}
      <NavItem>
        {#snippet start()}
          <Globe16 />
        {/snippet}
        Open Dropdown
        {#snippet end()}
          <ChevronDown12 />
        {/snippet}
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

<Story name="Right Position" asChild>
  <Dropdown position="right">
    {#snippet anchor()}
      <NavItem>
        {#snippet start()}
          <Globe16 />
        {/snippet}
        Open Dropdown
        {#snippet end()}
          <ChevronRight12 />
        {/snippet}
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

<Story name="With Nested Dropdown" asChild>
  <Dropdown position="right">
    {#snippet anchor()}
      <NavItem>
        {#snippet start()}
          <Globe16 />
        {/snippet}
        Open Dropdown
        {#snippet end()}
          <ChevronRight12 />
        {/snippet}
      </NavItem>
    {/snippet}
    {#snippet inner({ close })}
      <Menu>
        <NavItem onclick={close}>Item 1</NavItem>
        <NavItem onclick={close}>Item 2</NavItem>
        <Dropdown position="right">
          {#snippet anchor()}
            <NavItem>
              Item 3
              {#snippet end()}
                <ChevronRight12 />
              {/snippet}
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

<Story name="Multiple Dropdowns" asChild>
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      {#snippet anchor()}
        <NavItem>
          {#snippet start()}
            <Globe16 />
          {/snippet}
          First Dropdown
          {#snippet end()}
            <ChevronDown12 />
          {/snippet}
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
          {#snippet start()}
            <Globe16 />
          {/snippet}
          Second Dropdown
          {#snippet end()}
            <ChevronDown12 />
          {/snippet}
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
          {#snippet start()}
            <Globe16 />
          {/snippet}
          Third Dropdown
          {#snippet end()}
            <ChevronDown12 />
          {/snippet}
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

<Story name="Sibling Dropdowns With Nested" asChild>
  <div style="display: flex; gap: 2rem; align-items: center;">
    <Dropdown>
      {#snippet anchor()}
        <NavItem>
          {#snippet start()}
            <Globe16 />
          {/snippet}
          Simple Dropdown
          {#snippet end()}
            <ChevronDown12 />
          {/snippet}
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
          {#snippet start()}
            <Globe16 />
          {/snippet}
          Dropdown With Nested
          {#snippet end()}
            <ChevronDown12 />
          {/snippet}
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
                {#snippet end()}
                  <ChevronRight12 />
                {/snippet}
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
