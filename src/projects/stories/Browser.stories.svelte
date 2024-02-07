<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Browser from "../Browser.svelte";

  const args = { visible: true };
  import { projectHandlers } from "./mockData";

  export const meta = {
    title: "App / Projects / Browser",
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    component: Browser,
  };
</script>

<Template let:args>
  <Browser {...args} />
</Template>

<Story
  name="Success"
  {args}
  parameters={{ msw: { handlers: [projectHandlers.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [projectHandlers.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [projectHandlers.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [projectHandlers.empty] } }}
/>
