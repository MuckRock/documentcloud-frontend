<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    Book16,
    FileDirectory16,
    ListOrdered16,
    Pencil16,
  } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import { default as EmptyComponent } from "$lib/components/common/Empty.svelte";
  import Pin from "$lib/components/common/Pin.svelte";

  import SidebarGroup from "../SidebarGroup.svelte";

  const { Story } = defineMeta({
    title: "Navigation / Group",
    component: SidebarGroup,
    parameters: { layout: "centered" },
  });
</script>

<Story name="With Items" asChild>
  <SidebarGroup>
    {#snippet title()}
      <NavItem>
        {#snippet start()}
          <FileDirectory16 />
        {/snippet}
        Project
      </NavItem>
    {/snippet}
    {#snippet action()}
      <Action icon={Book16}>Explore</Action>
    {/snippet}
    <Flex direction="column" gap={0}>
      <NavItem small href="/project/1">
        {#snippet start()}
          <Pin active />
        {/snippet}
        Oldest Computer
      </NavItem>
      <NavItem small href="/project/2">
        {#snippet start()}
          <Pin active />
        {/snippet}
        FBI Files
      </NavItem>
      <NavItem small href="/project/3">
        {#snippet start()}
          <Pin active />
        {/snippet}
        1033 Project
      </NavItem>
    </Flex>
  </SidebarGroup>
</Story>

<Story name="Empty" asChild>
  <div style="width: 18rem">
    <SidebarGroup>
      {#snippet title()}
        <NavItem>
          {#snippet start()}
            <ListOrdered16 />
          {/snippet}
          Sections
        </NavItem>
      {/snippet}
      {#snippet action()}
        <Action icon={Pencil16}>Edit</Action>
      {/snippet}
      <EmptyComponent icon={ListOrdered16}>
        Sections organize your document with a table of contents
      </EmptyComponent>
    </SidebarGroup>
  </div>
</Story>

<Story name="Remember collapsed state" asChild>
  <p>Refresh to check that <code>collapsed</code> state persists</p>
  <SidebarGroup name="storybook-files">
    {#snippet title()}
      <NavItem>
        {#snippet start()}
          <FileDirectory16 />
        {/snippet}
        Project
      </NavItem>
    {/snippet}
    {#snippet action()}
      <Action icon={Book16}>Explore</Action>
    {/snippet}
    <Flex direction="column" gap={0}>
      <NavItem small href="/project/1">
        {#snippet start()}
          <Pin active />
        {/snippet}
        Oldest Computer
      </NavItem>
      <NavItem small href="/project/2">
        {#snippet start()}
          <Pin active />
        {/snippet}
        FBI Files
      </NavItem>
      <NavItem small href="/project/3">
        {#snippet start()}
          <Pin active />
        {/snippet}
        1033 Project
      </NavItem>
    </Flex>
  </SidebarGroup>
</Story>
