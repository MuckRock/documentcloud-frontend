<script context="module" lang="ts">
  import type { Project, ProjectMembershipList } from "$lib/api/types";

  // legacy css
  import "@/style/variables.css";
  import "@/style/global.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectEmbed from "../projects/[project_id]/+page.svelte";

  import documents from "$lib/api/fixtures/projects/project-documents-expanded.json";
  import project from "$lib/api/fixtures/projects/project.json";
  import * as mock from "$lib/api/fixtures/mock";

  export const meta = {
    title: "Embed / Project",
    component: ProjectEmbed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const data = {
    project: project as Project,
    documents: documents as ProjectMembershipList,
    embed: true,
    me: null,
    org: null,
  };
</script>

<Story
  name="default"
  parameters={{
    msw: { handlers: [mock.projects.info, mock.projects.documents] },
  }}
>
  <ProjectEmbed {data} />
</Story>
