<script context="module" lang="ts">
  // legacy css
  import "@/style/variables.css";
  import "@/style/legacy.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectEmbed from "../projects/[project_id]-[slug]/+page.svelte";

  import documents from "@/test/fixtures/documents/documents-expanded.json";
  import project from "@/test/fixtures/projects/project.json";
  import { projects } from "@/test/handlers/projects";
  import type { Page, Project, Document, APIResponse } from "@/lib/api/types";

  export const meta = {
    title: "Embed / Project",
    component: ProjectEmbed,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  };

  const data = {
    project: project as Project,
    documents: Promise.resolve({ data: documents } as APIResponse<
      Page<Document>,
      null
    >),
    embed: true,
    me: null,
    org: null,
    user_orgs: Promise.resolve([]),
    org_users: Promise.resolve([]),
    breadcrumbs: [],
    tipOfDay: null,
    error: undefined,
  };
</script>

<Story
  name="default"
  parameters={{
    msw: { handlers: [projects.info, projects.documents] },
  }}
>
  <div class="vh">
    <ProjectEmbed {data} />
  </div>
</Story>

<style>
  .vh {
    height: 100vh;
  }
</style>
