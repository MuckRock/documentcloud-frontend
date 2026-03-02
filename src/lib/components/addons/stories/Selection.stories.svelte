<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import SelectionDemo from "../tests/Selection.demo.svelte";
  import { documentsList } from "@/test/fixtures/documents";

  const docs = documentsList.results;

  const { Story } = defineMeta({
    title: "Add-Ons / Selection",
    component: SelectionDemo,
    parameters: { layout: "centered" },
  });
</script>

<Story
  name="Query Only"
  args={{
    documents: new Set(["query"]),
    query: "government spending",
    resultsCount: 42,
  }}
/>

<Story
  name="Selected Only"
  args={{
    docs,
    documents: new Set(["selected"]),
  }}
/>

<Story
  name="Both Options"
  args={{
    docs,
    documents: new Set(["query", "selected"]),
    query: "government spending",
    resultsCount: 42,
  }}
/>
