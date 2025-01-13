<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SortComponent from "../Sort.svelte";

  export const meta = {
    title: "Components / Documents / Sort",
    component: SortComponent,
    parameters: {
      layout: "centered",
    },
  };

  const args = {
    sort: "score",
    direction: "forward",
    fields: ["score", "created_at", "page_count", "title"],
  };
</script>

<Template let:args>
  <SortComponent {...args} />
</Template>

<Story name="Score (default)" {args} />

<Story
  name="Title, Z to A"
  args={{ ...args, sort: "title", direction: "reverse" }}
/>
