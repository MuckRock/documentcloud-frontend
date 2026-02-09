<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Documents from "../Documents.svelte";
  import ProcessContext from "../ProcessContext.svelte";

  import * as mock from "@/test/handlers/documents";

  const { Story } = defineMeta({
    title: "Processing / Documents",
    component: Documents,
    parameters: {
      layout: "centered",
      chromatic: { delay: 5000 }, // https://www.chromatic.com/docs/delay/
    },
  });
</script>

<Story
  name="default"
  parameters={{
    msw: { handlers: [mock.documents.list, mock.documents.pending] },
  }}
  asChild
>
  <ProcessContext>
    <Documents />
  </ProcessContext>
</Story>
