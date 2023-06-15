<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import AddOnEvent from "../runs/AddOnEvent.svelte";
  import event from "../fixtures/event.json";

  const args = { event };
</script>

<style></style>

<Meta
  title="Add-Ons / Event"
  component={AddOnEvent}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <AddOnEvent {...args} />
  </div>
</Template>

<Story name="Single" {args} />
