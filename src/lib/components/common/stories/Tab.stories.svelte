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

{#snippet withIcon()}<Note16 /> Note{/snippet}
{#snippet withoutIcon()}Note{/snippet}
{#snippet withHref()}<Note16 /> Notes{/snippet}

<Story
  name="Active"
  args={{ active: true, onclick: handleClick, children: withIcon }}
/>
<Story
  name="Disabled"
  args={{ disabled: true, onclick: handleClick, children: withIcon }}
/>
<Story
  name="Without Icon"
  args={{ onclick: handleClick, children: withoutIcon }}
/>
<Story
  name="Custom colors"
  args={{
    active: true,
    onclick: handleClick,
    children: withIcon,
  }}
>
  {#snippet template(args)}
    <Tab
      {...args}
      --text-color="var(--green-4)"
      --icon-color="var(--green-3)"
      --active-color="var(--orange-3)"
    />
  {/snippet}
</Story>
<Story name="With Href" args={{ href: "#note", children: withHref }} />
