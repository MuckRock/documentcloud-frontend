<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ViewerActions from "../ViewerActions.svelte";
  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Navigation / Viewer Actions",
    component: ViewerActions,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
  });
</script>

<Story
  name="Can Edit"
  args={{ document: { ...document, edit_access: true } }}
/>
<Story name="Can Read" args={{ document }} />
