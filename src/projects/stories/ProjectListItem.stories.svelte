<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import ProjectListItem from "../ProjectListItem.svelte";
  import { project, editableProject } from "../../test/fixtures/projects";

  const args = { project };

  export const meta = {
    title: "App / Projects / List Item",
    component: ProjectListItem,
    parameters: { layout: "centered" },
    argTypes: {
      editProject: {
        action: "edit project",
      },
    },
  };
</script>

<Template let:args>
  <ProjectListItem {...args} />
</Template>

<Story name="Default" {args} />
<Story
  name="Pinned"
  args={{ ...args, project: { ...args.project, pinned: true } }}
/>
<Story
  name="Long Description"
  args={{
    ...args,
    project: {
      ...args.project,
      title: "Fancy Project",
      description:
        "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    },
  }}
/>

<Story
  name="Private Project"
  args={{
    ...args,
    project: {
      ...args.project,
      private: true,
    },
  }}
/>

<Story
  name="Editable Project"
  args={{
    ...args,
    project: editableProject,
  }}
/>
