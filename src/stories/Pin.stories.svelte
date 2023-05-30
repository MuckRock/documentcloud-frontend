<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import Pin from "@/common/Pin.svelte";

  const args = {
    active: false,
    disabled: false,
  };

  const onClick = action("Click");
</script>

<Meta
  title="Common / Pin"
  tags={["autodocs"]}
  component={Pin}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <Pin {...args} on:click={onClick} />
</Template>

<Story name="Default" {args} />
<Story name="Active" args={{ ...args, active: true }} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
<Story name="Large" args={{ ...args, size: 3 }} />
