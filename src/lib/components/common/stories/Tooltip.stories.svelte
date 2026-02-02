<script context="module" lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Button from "../Button.svelte";
  import Tooltip from "../Tooltip.svelte";

  const { Story } = defineMeta({
    title: "Common / Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  });

  type Args = ComponentProps<typeof Tooltip>;
</script>

{#snippet template(args: Args)}
  <Tooltip {...args}>
    <Button>Hover me</Button>
  </Tooltip>
{/snippet}

<Story name="Basic" args={{ caption: "I'm a tooltip" }} {template} />

<Story
  name="Long Message"
  args={{
    caption:
      "I'm a tooltip with a really long message that may overflow the anchor position",
  }}
  {template}
/>

<Story
  name="With Arrow"
  args={{ caption: "I'm a tooltip with an arrow", arrow: true }}
  {template}
/>
