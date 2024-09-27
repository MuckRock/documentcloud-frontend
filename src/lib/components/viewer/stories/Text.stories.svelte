<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  export const meta = {
    title: "Components / Viewer / Text",
    component: Text,
    parameters: { layout: "centered" },
  };

  import { document } from "@/test/fixtures/documents";
  import text from "@/test/fixtures/documents/document.txt.json";
  import ViewerContext from "../ViewerContext.svelte";
</script>

<Story name="default">
  <ViewerContext {document} {text}>
    <Text />
  </ViewerContext>
</Story>
