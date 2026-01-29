<script lang="ts" context="module">
  import { projectList } from "@/test/fixtures/projects";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  const { Story } = defineMeta({
    title: "Navigation / Projects",
    component: Projects,
    parameters: { layout: "centered" },
  });
</script>

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
      state: {
        page: {
          data: { pinnedProjects: [] },
        },
      },
    },
  }}
/>
