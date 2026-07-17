<script module lang="ts">
  import type { ViewerMode } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PageEmbed from "../documents/[id]/pages/[page]/+page.svelte";

  import { documentExpanded } from "@/test/fixtures/documents";

  const page = 1;
  const notes =
    documentExpanded.notes?.filter((note) => note.page_number === page - 1) ??
    [];

  const { Story } = defineMeta({
    title: "Embed / Page",
    component: PageEmbed,
    parameters: { layout: "centered" },
  });

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

<Story name="default" asChild>
  <PageEmbed {data} />
</Story>
