<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  import { document } from "@/test/fixtures/documents";
  import text from "@/test/fixtures/documents/document.txt.json";
  import ViewerContext from "../ViewerContext.svelte";

  const { Story } = defineMeta({
    title: "Viewer / Text",
    component: Text,
    parameters: { layout: "centered" },
  });
</script>

<Story name="default" asChild>
  <ViewerContext {document} text={Promise.resolve(text)}>
    <Text />
  </ViewerContext>
</Story>
