<script context="module" lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Pin from "../Pin.svelte";

  const args = {
    active: false,
    disabled: false,
  };

  const onClick = action("Click");

  const { Story } = defineMeta({
    title: "Common / Pin",
    tags: ["autodocs"],
    component: Pin,
    parameters: { layout: "centered" },
    render: template,
  });
</script>

{#snippet template(args)}
  <Pin {...args} onclick={onClick} />
{/snippet}

<Story name="Default" {args} />
<Story name="Active" args={{ ...args, active: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
<Story name="Large" args={{ ...args, size: 3 }} />
