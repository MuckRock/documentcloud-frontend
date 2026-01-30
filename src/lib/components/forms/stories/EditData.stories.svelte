<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditData from "../EditData.svelte";
  import EditDataMany from "../EditDataMany.svelte";

  import doc from "@/test/fixtures/documents/examples/the-santa-anas.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Forms / Edit data",
    parameters: { layout: "centered" },
  });
</script>

<Story name="one document">
  <EditData {document} />
</Story>

<Story name="many documents">
  <EditDataMany documents={[document]} onclose={() => {}} />
</Story>

<Story name="too many documents">
  <EditDataMany documents={Array(100).fill(document)} onclose={() => {}} />
</Story>
