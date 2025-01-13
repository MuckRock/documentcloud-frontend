<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SearchComponent from "../Search.svelte";
  import { projects } from "@/test/handlers/projects";
  import { organizations, users } from "@/test/handlers/accounts";

  export const meta = {
    title: "Components / Documents / Search",
    component: SearchComponent,
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
  <SearchComponent {...args} />
</Template>

<Story name="Default" {args} />

<Story
  name="Prefilled from URL"
  parameters={{
    sveltekit_experimental: {
      stores: {
        page: {
          url: new URL(
            `https://www.dev.documentcloud.org/documents/?q=${encodeURIComponent("los angeles sort:created_at access:private created_at:[2021-01-01T00:00:00Z TO 2021-12-31T11:59:59Z]")}`,
          ),
        },
      },
    },
  }}
/>
