<script lang="ts" context="module">
  import { projectList } from "@/test/fixtures/projects";
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";
  import type { Meta } from "@storybook/svelte";

  export const meta: Meta = {
    title: "Components / Sidebar / Projects",
    component: Projects,
    parameters: { layout: "centered" },
  };

  let args = {
    pinned: projectList.results.slice(0, 4),
  };
</script>

<Template let:args>
  <Projects {...args} />
</Template>

<Story
  name="With Pinned Projects"
  parameters={{
    sveltekit_experimental: {
      stores: {
        page: {
          data: {
            pinnedProjects: projectList.results.slice(0, 4).map((project) => {
              project.pinned = true;
              return project;
            }),
          },
        },
      },
    },
  }}
/>
<Story
  name="Without Pinned Projects"
  parameters={{
    sveltekit_experimental: {
      stores: {
        page: {
          data: { pinnedProjects: [] },
        },
      },
    },
  }}
/>
