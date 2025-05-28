<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import {
    Comment16,
    Home16,
    Link16,
    Paintbrush16,
    FileDirectory16,
  } from "svelte-octicons";
  import SidebarItem from "../SidebarItem.svelte";
  import Flex from "../../common/Flex.svelte";

  export const meta = {
    title: "Components / Sidebar / Item",
    component: SidebarItem,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const click = action("Click");
  const keydown = action("Keydown");
</script>

<Story name="Text Only">
  <SidebarItem>Example</SidebarItem>
</Story>

<Story name="Text and Icon">
  <SidebarItem>
    <Comment16 slot="start" /> Add a note…
  </SidebarItem>
</Story>

<Story name="Link">
  <SidebarItem href="/" on:click={click} on:keydown={keydown}>
    <Home16 slot="start" /> Go Home
  </SidebarItem>
</Story>

<Story name="Hover">
  <SidebarItem hover>
    <Home16 slot="start" /> Go Home
  </SidebarItem>
</Story>

<Story name="Active">
  <Flex>
    <SidebarItem active>Static</SidebarItem>
    <SidebarItem active href="#">
      <Link16 slot="start" /> Link
    </SidebarItem>
    <SidebarItem
      active
      --active-background="var(--orange-2)"
      --active-color="var(--orange-4)"
      --active-fill="var(--orange-3)"
    >
      <Paintbrush16 slot="start" /> Custom Active Colors
    </SidebarItem>
  </Flex>
</Story>

<Story name="Small">
  <SidebarItem small>
    <Comment16 slot="start" /> Add a note…
  </SidebarItem>
</Story>

<Story name="Disabled">
  <SidebarItem disabled>
    <Comment16 slot="start" /> Add a note…
  </SidebarItem>
</Story>

<Story name="With Overflow">
  <div class="maxW-16">
    <SidebarItem disabled>
      <FileDirectory16 slot="start" /> A very long sidebar item maybe a project
    </SidebarItem>
  </div>
</Story>

<Story name="Absurdly long name">
  <SidebarItem>
    The International Consortium for the Real-Time Dissemination of Verified,
    Unbiased, Cross-Platform, Community-Sourced, Multilingual, Deep-Dive
    Investigative Journalism and Global News Analysis Network for Socioeconomic,
    Environmental, Political, Technological, and Humanitarian Affairs Reporting
    and Strategic Public Information Engagement Across All Media Channels
    Initiative
  </SidebarItem>
</Story>

<style>
  .maxW-16 {
    max-width: 16rem;
  }
</style>
