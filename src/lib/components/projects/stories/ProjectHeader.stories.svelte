<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import ProjectHeader from "../ProjectHeader.svelte";

  import { project } from "@/test/fixtures/projects";

  export const meta = {
    title: "Components / Projects / Header",
    component: ProjectHeader,
    parameters: { layout: "centered" },
  };

  let args = {
    project: {
      ...project,
      description:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
    },
  };
</script>

<Template let:args>
  <ProjectHeader {...args} />
</Template>

<Story name="Public" {args} />

<Story
  name="Private"
  args={{
    project: {
      ...project,
      private: true,
    },
  }}
/>
