<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import ProjectShare from "../ProjectShare.svelte";

  import { project } from "@/test/fixtures/projects";
  import Toaster from "../../layouts/Toaster.svelte";

  export const meta = {
    title: "Projects / Share",
    component: ProjectShare,
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
  <ProjectShare {...args} />
  <Toaster />
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

<Story
  name="Private, Can Edit"
  args={{
    project: {
      ...project,
      private: true,
      edit_access: true,
    },
  }}
/>
