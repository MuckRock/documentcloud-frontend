<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { history, scheduled } from "../../../test/handlers/addons";
  import Runs from "../Runs.svelte";

  const args = { visible: true };

  export const meta = {
    title: "Add-Ons / Runs",
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    component: Runs,
  };
</script>

<Template let:args>
  <Runs {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{
    msw: { handlers: [history.data, scheduled.data] },
  }}
/>
<Story
  name="Loading"
  {args}
  parameters={{
    msw: { handlers: [history.loading, scheduled.loading] },
  }}
/>
<Story
  name="Error"
  {args}
  parameters={{
    msw: { handlers: [history.error, scheduled.error] },
  }}
/>
<Story
  name="Empty"
  {args}
  parameters={{
    msw: { handlers: [history.empty, scheduled.empty] },
  }}
/>
