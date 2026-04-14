<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
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

  const { Story } = defineMeta({
    title: "Navigation / Item",
    component: NavItem,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  const click = action("Click");
</script>

<Story name="Text Only" asChild>
  <NavItem>Example</NavItem>
</Story>

<Story name="Text and Icon" asChild>
  <NavItem>
    {#snippet start()}
      <Comment16 />
    {/snippet} Add a note…
  </NavItem>
</Story>

<Story name="Link" asChild>
  <NavItem href="/" onclick={click}>
    {#snippet start()}
      <Home16 />
    {/snippet} Go Home
  </NavItem>
</Story>

<Story name="Hover" asChild>
  <NavItem hover>
    {#snippet start()}
      <Home16 />
    {/snippet} Go Home
  </NavItem>
</Story>

<Story name="Active" asChild>
  <Flex>
    <NavItem active>Static</NavItem>
    <NavItem active href="#">
      {#snippet start()}
        <Link16 />
      {/snippet} Link
    </NavItem>
    <NavItem
      active
      --active-background="var(--orange-2)"
      --active-color="var(--orange-4)"
      --active-fill="var(--orange-3)"
    >
      {#snippet start()}
        <Paintbrush16 />
      {/snippet} Custom Active Colors
    </NavItem>
  </Flex>
</Story>

<Story name="Small" asChild>
  <NavItem small>
    {#snippet start()}
      <Comment16 />
    {/snippet} Add a note…
  </NavItem>
</Story>

<Story name="Disabled" asChild>
  <NavItem disabled>
    {#snippet start()}
      <Comment16 />
    {/snippet} Add a note…
  </NavItem>
</Story>

<Story name="With Overflow" asChild>
  <div class="maxW-16">
    <NavItem disabled>
      {#snippet start()}
        <FileDirectory16 />
      {/snippet} A very long sidebar item maybe a project
    </NavItem>
  </div>
</Story>

<Story name="Absurdly long name" asChild>
  <div class="maxW-32">
    <NavItem>
      The International Consortium for the Real-Time Dissemination of Verified,
      Unbiased, Cross-Platform, Community-Sourced, Multilingual, Deep-Dive
      Investigative Journalism and Global News Analysis Network for
      Socioeconomic, Environmental, Political, Technological, and Humanitarian
      Affairs Reporting and Strategic Public Information Engagement Across All
      Media Channels Initiative
    </NavItem>
  </div>
</Story>

<style>
  .maxW-16 {
    max-width: 16rem;
  }
  .maxW-32 {
    max-width: 32rem;
  }
</style>
