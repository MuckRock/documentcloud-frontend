<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Search from "../Search.svelte";

  export const meta = {
    title: "Components / Inputs / Search",
    component: Search,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Search {...args} />
</Template>

<Story name="Empty" />

<Story name="With Placeholder" args={{ placeholder: "Start searching…" }} />

<Story name="With Query" args={{ value: "documents" }} />
