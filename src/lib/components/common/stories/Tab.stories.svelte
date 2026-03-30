<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import { Note16 } from "svelte-octicons";
  import Tab from "../Tab.svelte";

  const { Story } = defineMeta({
    title: "Common / Tab",
    component: Tab,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  });

  function handleClick() {
    action("click");
  }
</script>

<Story name="Active">
  {#snippet template(args)}
    <Tab active {...args} on:click={handleClick}><Note16 /> Note</Tab>
  {/snippet}
</Story>

<Story name="Disabled">
  {#snippet template(args)}
    <Tab disabled {...args} on:click={handleClick}><Note16 /> Note</Tab>
  {/snippet}
</Story>

<Story name="Without Icon">
  {#snippet template(args)}
    <Tab {...args} on:click={handleClick}>Note</Tab>
  {/snippet}
</Story>

<Story name="Custom colors">
  {#snippet template(args)}
    <Tab
      active
      {...args}
      on:click={handleClick}
      --text-color="var(--green-4)"
      --icon-color="var(--green-3)"
      --active-color="var(--orange-3)"><Note16 /> Note</Tab
    >
  {/snippet}
</Story>

<Story name="With Href">
  {#snippet template(args)}
    <Tab {...args} href="#note"><Note16 /> Notes</Tab>
  {/snippet}
</Story>
