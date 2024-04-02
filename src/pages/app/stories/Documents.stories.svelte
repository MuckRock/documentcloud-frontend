<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";

  import { layout } from "../../../manager/layout.js";
  import { users, organizations } from "../../../test/handlers/accounts";
  import { projects } from "../../../test/handlers/projects";
  import { runs } from "../../../test/handlers/addons";

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

  const handlers = [
    users.data,
    users.me,
    organizations.data,
    projects.data,
    runs.empty,
  ];
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
      handlers,
    },
  }}
/>

<Story
  name="embed"
  args={{ ...args, embed: true }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>

<Story
  name="dialog"
  args={{ ...args, dialog: true }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>
