<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Browser from "../Browser.svelte";

  const args = { visible: true };
  import { addons } from "./mockData";

  export const meta = {
    title: "Add-Ons / Browser",
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
  parameters={{ msw: { handlers: [addons.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [addons.loading] } }}
/>
<Story name="Error" {args} parameters={{ msw: { handlers: [addons.error] } }} />
<Story name="Empty" {args} parameters={{ msw: { handlers: [addons.empty] } }} />
