<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AccessLevel from "../AccessLevel.svelte";

  export const meta = {
    title: "Forms / Inputs /Access Level",
    component: AccessLevel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    selected: "private",
  };
</script>

<Template let:args>
  <AccessLevel {...args} />
</Template>

<Story name="Private" {args} />
<Story name="Organization" args={{ ...args, selected: "organization" }} />
<Story name="Public" args={{ ...args, selected: "public" }} />
<Story name="Row" args={{ ...args, direction: "row" }} />
<Story name="Required" args={{ required: true, selected: null }} />
