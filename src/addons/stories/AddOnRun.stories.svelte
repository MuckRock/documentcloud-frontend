<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import AddOnRun from "../AddOnRun.svelte";
  import run from "../fixtures/run.json";

  const args = { run };
</script>

<style></style>

<Meta
  title="Add-Ons / Run"
  component={AddOnRun}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <AddOnRun {...args} />
  </div>
</Template>

<Story name="Single" {args} />
