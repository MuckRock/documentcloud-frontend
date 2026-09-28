<script module lang="ts">
  import type { Document } from "$lib/api/types";

  import { defineMeta } from "@storybook/addon-svelte-csf";

  import ViewerActions from "../sidebar/ViewerActions.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import doc from "@/test/fixtures/documents/document-expanded.json";

  // Notes load separately from the document, so split them off the fixture.
  const { notes = [], ...document } = doc as Document;

  const { Story } = defineMeta({
    title: "Navigation / Viewer Actions",
    component: ViewerActions,
    parameters: { layout: "centered" },
    tags: ["autodocs"],
    render: template,
  });
</script>

<!-- ViewerActions renders from its `document` prop but reads `page` and
     `notes` off the viewer state, so it needs a provider. `loadPdf` is off because nothing here
     draws a page. -->
{#snippet template(args)}
  <ViewerContext document={args.document} {notes} loadPdf={false}>
    <ViewerActions {...args} />
  </ViewerContext>
{/snippet}

<Story
  name="Can Edit"
  args={{ document: { ...document, edit_access: true } }}
/>
<Story name="Can Read" args={{ document }} />
