<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SelectionToolbar from "../SelectionToolbar.svelte";
  import SelectablePage from "./SelectablePage.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import { document } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Toolbars / Selection",
    component: SelectionToolbar,
    parameters: { layout: "fullscreen" },
  });

  const text =
    "The Santa Ana winds come down through the mountain passes and blow up " +
    "to one hundred miles an hour. Select any text on this page to see the " +
    "toolbar follow the selection.";
</script>

<!-- The toolbar positions itself against a live Range, so each story renders a
     page of selectable text instead of passing a selection in as an arg. -->

<Story name="Default" asChild>
  <ViewerContext {document} notes={[]} loadPdf={false}>
    <SelectablePage {text} preselect="mountain passes" />
  </ViewerContext>
</Story>

<Story name="Near the top of the page" asChild>
  <ViewerContext {document} notes={[]} loadPdf={false}>
    <SelectablePage {text} preselect="Santa Ana" offsetTop={8} />
  </ViewerContext>
</Story>

<Story name="Without edit access" asChild>
  <ViewerContext
    document={{ ...document, edit_access: false }}
    notes={[]}
    loadPdf={false}
  >
    <SelectablePage {text} preselect="mountain passes" />
  </ViewerContext>
</Story>
