<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ProjectHeader from "../ProjectHeader.svelte";

  import { project } from "@/test/fixtures/projects";

  const { Story } = defineMeta({
    title: "Projects / Header",
    component: ProjectHeader,
    parameters: { layout: "centered" },
  });

  let args = {
    project: {
      ...project,
      description:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
    },
  };
</script>

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
