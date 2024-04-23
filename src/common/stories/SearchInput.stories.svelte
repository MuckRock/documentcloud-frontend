<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import SearchInput from "../SearchInput.svelte";

  const args = {};

  export const meta = {
    title: "Common / Search",
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    component: SearchInput,
  };
</script>

<Template let:args>
  <SearchInput {...args} />
</Template>

<Story name="Search" {args} />
