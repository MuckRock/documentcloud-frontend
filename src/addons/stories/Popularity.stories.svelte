<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Popularity from "../Popularity.svelte";

  export const meta = {
    title: "Add-Ons / Popularity",
    tags: ["autodocs"],
    component: Popularity,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <Popularity {...args} />
</Template>

<Story name="Tens" args={{ useCount: 84 }} />
<Story name="Hundreds" args={{ useCount: 175 }} />
<Story name="Thousands" args={{ useCount: 33456 }} />
<Story name="Millions" args={{ useCount: 1203495 }} />
