<script context="module" lang="ts">
  import type { Document, Note } from "$lib/api/types";
  // legacy css
  import "@/style/variables.css";
  import "@/style/global.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import PageEmbed from "../documents/[id]/pages/[page]/+page.svelte";
  import document from "$lib/api/fixtures/documents/document-expanded.json";
  import { results } from "$lib/api/fixtures/notes/notes-expanded.json";

  const page = 1;
  const notes = results.filter((note) => note.page_number === page - 1);

  export const meta = {
    title: "Embed / Page",
    component: PageEmbed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const data = {
    document: document as Document,
    page,
    notes: notes as Note[],
    embed: false,
    me: null,
    org: null,
    user_orgs: Promise.resolve([]),
    org_users: Promise.resolve([]),
    breadcrumbs: [],
  };
</script>

<Story name="default">
  <PageEmbed {data} />
</Story>
