<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Button from "../Button.svelte";
  import Tooltip from "../Tooltip.svelte";

  export const meta = {
    title: "Components / Common / Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
  };

  let args = {
    mode: "normal",
  };
</script>

<Story name="Basic" let:args>
  <Tooltip caption="I'm a tooltip">
    <Button>Hover me</Button>
  </Tooltip>
</Story>

<Story name="Long Message" let:args>
  <Tooltip
    caption="I'm a tooltip with a really long message that may overflow the anchor position"
  >
    <Button>Hover me</Button>
  </Tooltip>
</Story>

<Story name="With Arrow" let:args>
  <Tooltip caption="I'm a tooltip with an arrow" arrow>
    <Button>Hover me</Button>
  </Tooltip>
</Story>
