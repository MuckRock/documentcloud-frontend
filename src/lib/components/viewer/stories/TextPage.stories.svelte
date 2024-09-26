<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import TextPage from "../TextPage.svelte";

  export const meta = {
    title: "Components / Documents / Text page",
    component: TextPage,
    parameters: { layout: "centered" },
  };

  import txt from "@/test/fixtures/documents/document.txt.json";

  const page = txt.pages[0];
  const query = "los angeles";
</script>

<Story name="default">
  <TextPage page={page.page} contents={page.contents} />
</Story>

<Story name="search results">
  <TextPage page={page.page} contents={page.contents} {query} />
</Story>
