<script context="module" lang="ts">
  import type { ViewerMode } from "$lib/api/types";
  // legacy css
  import "@/style/variables.css";
  import "@/style/legacy.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import PageEmbed from "../documents/[id]/pages/[page]/+page.svelte";

  import { documentExpanded } from "@/test/fixtures/documents";

  const page = 1;
  const notes =
    documentExpanded.notes?.filter((note) => note.page_number === page - 1) ??
    [];

  export const meta = {
    title: "Embed / Page",
    component: PageEmbed,
    parameters: { layout: "centered" },
  };

  const data = {
    document: documentExpanded,
    page,
    notes,
    embed: false,
    mode: "document" as ViewerMode,
    me: null,
    org: null,
    user_orgs: Promise.resolve([]),
    org_users: Promise.resolve([]),
    breadcrumbs: [],
    tipOfDay: null,
    settings: {},
  };
</script>

<Story name="default">
  <PageEmbed {data} />
</Story>
