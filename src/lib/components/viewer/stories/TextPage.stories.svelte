<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import TextPage from "../TextPage.svelte";

  export const meta = {
    title: "Components / Viewer / Text page",
    component: TextPage,
    parameters: { layout: "centered" },
  };

  import { document } from "@/test/fixtures/documents";
  import txt from "@/test/fixtures/documents/document.txt.json";

  const page = txt.pages[0];
  const query = "los angeles";
</script>

<Story name="default">
  <TextPage {document} page={page.page} contents={page.contents} />
</Story>

<Story name="search results">
  <TextPage {document} page={page.page} contents={page.contents} {query} />
</Story>
