<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import AccessLevel from "../AccessLevel.svelte";

  export const meta = {
    title: "Components / Inputs / Access Level",
    component: AccessLevel,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  let args = {
    level: "private",
  };
</script>

<Template let:args>
  <AccessLevel {...args} />
</Template>

<Story name="Private" {args} />
<Story name="Organization" args={{ ...args, level: "organization" }} />
<Story name="Public" args={{ ...args, level: "public" }} />
<Story name="Row" args={{ ...args, direction: "row" }} />
