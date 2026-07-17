<script module lang="ts">
  import type { ComponentProps } from "svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProjectShare from "../ProjectShare.svelte";

  import { project } from "@/test/fixtures/projects";
  import Toaster from "../../layouts/Toaster.svelte";

  const { Story } = defineMeta({
    title: "Projects / Share",
    component: ProjectShare,
    parameters: { layout: "centered" },
    render: template,
  });

  let args = {
    project: {
      ...project,
      description:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
    },
  };
</script>

{#snippet template(args: ComponentProps<typeof ProjectShare>)}
  <ProjectShare {...args} />
  <Toaster />
{/snippet}

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
