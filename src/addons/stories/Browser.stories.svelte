<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Browser from "../Browser.svelte";

  const args = { visible: true };
</script>

<Meta
  title="Add-Ons / Browser"
  tags={["autodocs"]}
  parameters={{ layout: "fullscreen" }}
  component={Browser}
/>

<Template let:args>
  <Browser {...args} />
</Template>

<Story name="Default" {args} />
