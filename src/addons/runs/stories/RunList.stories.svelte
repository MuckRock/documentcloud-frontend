<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import RunList from "../RunList.svelte";
  import { results as runs } from "../../fixtures/run-list.json";

  const args = { runs };
</script>

<style></style>

<Meta
  title="Add-Ons / Runs"
  component={RunList}
  parameters={{ layout: "centered" }}
/>

<Template let:args>
  <div class="container">
    <RunList {...args} />
  </div>
</Template>

<Story name="Single" {args} />
