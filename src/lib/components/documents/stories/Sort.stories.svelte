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
    sort: "created_at",
    order: "desc",
    fields: ["created_at", "page_count", "title"],
  };
</script>

<Template let:args>
  <SortComponent {...args} />
</Template>

<Story name="Created At, Descending (default)" {args} />

<Story
  name="Title, Ascending"
  args={{ ...args, sort: "title", order: "asc" }}
/>
