<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";

  import { layout } from "../../../manager/layout.js";
  import * as mock from "./mock.js";

  export const meta = {
    title: "App / Documents / Documents",
    component: Documents,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  layout.loading = false;

  const args = {
    embed: false,
    containerWidth: null,
    containerHeight: null,
    dialog: false,
  };

  let container;
</script>

<Template let:args>
  <div class="container" bind:this={container}>
    <Documents {...args} containerElem={container} />
  </div>
</Template>

<Story
  name="default"
  {args}
  parameters={{
    msw: {
      handlers: [
        mock.users.data,
        mock.users.me,
        mock.organizations.data,
        mock.projects.data,
        mock.runs.data,
      ],
    },
  }}
/>

<Story
  name="embed"
  args={{ ...args, embed: true }}
  parameters={{
    msw: {
      handlers: [
        mock.users.data,
        mock.users.me,
        mock.organizations.data,
        mock.projects.data,
        mock.runs.data,
      ],
    },
  }}
/>

<Story
  name="dialog"
  args={{ ...args, dialog: true }}
  parameters={{
    msw: {
      handlers: [
        mock.users.data,
        mock.users.me,
        mock.organizations.data,
        mock.projects.data,
        mock.runs.data,
      ],
    },
  }}
/>
