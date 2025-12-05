<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Language from "../Language.svelte";

  export const meta = {
    title: "Forms / Inputs /Language",
    component: Language,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <div>
    <Language placeholder="Language" {...args} />
  </div>
</Template>

<Story name="default" />

<Story name="multiple" args={{ multiple: true }} />

<style>
  div {
    min-width: 40ch;
  }
</style>
