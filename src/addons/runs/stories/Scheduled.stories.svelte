<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Scheduled from "../Scheduled.svelte";
  import { scheduled } from "./mockData";

  const args = {};

  export const meta = {
    title: "Add-Ons / Runs / Scheduled",
    component: Scheduled,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Scheduled {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [scheduled.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [scheduled.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [scheduled.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [scheduled.empty] } }}
/>
