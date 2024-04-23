<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Browser from "../Browser.svelte";

  const args = { visible: true };
  import { projects } from "../../test/handlers/projects";
  import { mockGetMe } from "../../test/handlers/accounts";

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
  parameters={{ msw: { handlers: [mockGetMe.data, projects.data] } }}
/>
<Story
  name="Loading"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.data, projects.loading] } }}
/>
<Story
  name="Error"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.data, projects.error] } }}
/>
<Story
  name="Empty"
  {args}
  parameters={{ msw: { handlers: [mockGetMe.data, projects.empty] } }}
/>
