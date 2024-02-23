<script context="module">
  // legacy css
  import "@/style/variables.css";
  import "@/style/global.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import PageEmbed from "../(embed)/documents/[id]/pages/[page]/+page.svelte";

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

  const data = { document, page, notes };
</script>

<Story name="default">
  <PageEmbed {data} />
</Story>
