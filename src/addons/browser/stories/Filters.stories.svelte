<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Filters from "../Filters.svelte";

  const args = {};

  export const meta = {
    title: "Add-Ons / Browser / Components / Filters",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: Filters,
  };
</script>

<Template let:args>
  <Filters {...args} />
</Template>

<Story id="addonFilters" name="Filters" {args} />
