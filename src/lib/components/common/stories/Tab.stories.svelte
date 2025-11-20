<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import { Note16 } from "svelte-octicons";
  import Tab from "../Tab.svelte";

  export const meta = {
    title: "Common / Tab",
    component: Tab,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  };

  function handleClick() {
    action("click");
  }
</script>

<Story name="Active" let:args>
  <Tab active {...args} on:click on:click={handleClick}><Note16 /> Note</Tab>
</Story>

<Story name="Disabled" let:args>
  <Tab disabled {...args} on:click on:click={handleClick}><Note16 /> Note</Tab>
</Story>

<Story name="Without Icon" let:args>
  <Tab {...args} on:click on:click={handleClick}>Note</Tab>
</Story>

<Story name="Custom colors" let:args>
  <Tab
    active
    {...args}
    on:click
    on:click={handleClick}
    --text-color="var(--green-4)"
    --icon-color="var(--green-3)"
    --active-color="var(--orange-3)"><Note16 /> Note</Tab
  >
</Story>

<Story name="With Href" let:args>
  <Tab {...args} href="#note"><Note16 /> Notes</Tab>
</Story>
