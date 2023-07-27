<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Runs from "../Runs.svelte";
  import { results as events } from "../../fixtures/event-list.json";
  import { results as runs } from "../../fixtures/run-list.json";

  const args = { visible: true, events, runs };
</script>

<Meta
  title="Add-Ons / Run list"
  tags={["autodocs"]}
  parameters={{ layout: "fullscreen" }}
  component={Runs}
/>

<Template let:args>
  <Runs {...args} />
</Template>

<Story name="Default" {args} />
