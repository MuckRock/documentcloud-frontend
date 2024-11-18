<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Pin from "../Pin.svelte";

  const args = {
    active: false,
    disabled: false,
  };

  const onClick = action("Click");

  export const meta = {
    title: "Common / Pin",
    tags: ["autodocs"],
    component: Pin,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Pin {...args} on:click={onClick} />
</Template>

<Story name="Default" {args} />
<Story name="Active" args={{ ...args, active: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
<Story name="Large" args={{ ...args, size: 3 }} />
