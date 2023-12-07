<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import History from "../History.svelte";
  import { history } from "./mockData";

  const args = {};

  export const meta = {
    title: "Add-Ons / Runs / History",
    component: History,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <History {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [history.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [history.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [history.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [history.empty] } }}
/>
