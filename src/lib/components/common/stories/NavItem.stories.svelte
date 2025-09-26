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
  import NavItem from "../NavItem.svelte";
  import Flex from "../../common/Flex.svelte";

  export const meta = {
    title: "Components / Sidebar / Item",
    component: NavItem,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const click = action("Click");
  const keydown = action("Keydown");
</script>

<Story name="Text Only">
  <NavItem>Example</NavItem>
</Story>

<Story name="Text and Icon">
  <NavItem>
    <Comment16 slot="start" /> Add a note…
  </NavItem>
</Story>

<Story name="Link">
  <NavItem href="/" on:click={click} on:keydown={keydown}>
    <Home16 slot="start" /> Go Home
  </NavItem>
</Story>

<Story name="Hover">
  <NavItem hover>
    <Home16 slot="start" /> Go Home
  </NavItem>
</Story>

<Story name="Active">
  <Flex>
    <NavItem active>Static</NavItem>
    <NavItem active href="#">
      <Link16 slot="start" /> Link
    </NavItem>
    <NavItem
      active
      --active-background="var(--orange-2)"
      --active-color="var(--orange-4)"
      --active-fill="var(--orange-3)"
    >
      <Paintbrush16 slot="start" /> Custom Active Colors
    </NavItem>
  </Flex>
</Story>

<Story name="Small">
  <NavItem small>
    <Comment16 slot="start" /> Add a note…
  </NavItem>
</Story>

<Story name="Disabled">
  <NavItem disabled>
    <Comment16 slot="start" /> Add a note…
  </NavItem>
</Story>

<Story name="With Overflow">
  <div class="maxW-16">
    <NavItem disabled>
      <FileDirectory16 slot="start" /> A very long sidebar item maybe a project
    </NavItem>
  </div>
</Story>

<Story name="Absurdly long name">
  <NavItem>
    The International Consortium for the Real-Time Dissemination of Verified,
    Unbiased, Cross-Platform, Community-Sourced, Multilingual, Deep-Dive
    Investigative Journalism and Global News Analysis Network for Socioeconomic,
    Environmental, Political, Technological, and Humanitarian Affairs Reporting
    and Strategic Public Information Engagement Across All Media Channels
    Initiative
  </NavItem>
</Story>

<style>
  .maxW-16 {
    max-width: 16rem;
  }
</style>
