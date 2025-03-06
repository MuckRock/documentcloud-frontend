<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import FilterComponent from "../Filter.svelte";
  import { projects } from "@/test/handlers/projects";
  import { organizations, users } from "@/test/handlers/accounts";

  export const meta = {
    title: "Components / Documents / Filter",
    component: FilterComponent,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [projects.info, users.data, organizations.data],
      },
    },
  };

  const args = {};
</script>

<Template let:args>
  <FilterComponent {...args} />
</Template>

<Story name="Default" {args} />
