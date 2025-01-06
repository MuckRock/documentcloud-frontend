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
    sort: "updated_at",
    order: "desc",
    fields: ["updated_at", "created_at", "page_count", "title"],
  };
</script>

<Template let:args>
  <SortComponent {...args} />
</Template>

<Story name="Updated At, Descending (default)" {args} />

<Story
  name="Title, Ascending"
  args={{ ...args, sort: "title", order: "asc" }}
/>
