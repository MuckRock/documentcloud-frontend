<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import Text from "../Text.svelte";

  export const meta = {
    title: "Components / Viewer / Text",
    component: Text,
    parameters: { layout: "centered" },
  };

  import txt from "@/test/fixtures/documents/document.txt.json";
</script>

<Story name="default">
  <Text text={txt} />
</Story>
