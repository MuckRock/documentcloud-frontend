<script module lang="ts">
  import type { Document } from "$lib/api/types";
  import type { ViewerState } from "$lib/state/viewer.svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ViewerContext from "../ViewerContext.svelte";
  import { DragDropProvider } from "@dnd-kit/svelte";
  import GridPage from "../GridPage.svelte";
  import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";

  import { pageImageUrl } from "$lib/api/documents";

  import doc from "@/test/fixtures/documents/examples/lefler-thesis.json";

  const { notes = [], ...document } = doc as Document;

  const { Story } = defineMeta({
    title: "Viewer / Grid Page",
    component: GridPage,
    parameters: { layout: "centered" },
    render: template,
  });

  const width = 180;
  const portrait = {
    id: 1,
    index: 0,
    width,
    height: width * (792 / 612),
    margin: 0,
    rotation: 0,
    src: pageImageUrl(document, 1, "small").href,
  };

  let args = {
    context: { document, notes, mode: "grid" },
    page: portrait,
    selected: false,
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args.context} loadPdf={false}>
    <ViewerProbe
      onViewer={(viewer: ViewerState) => {
        if (args.selected) viewer.selectedPages.add(args.page.id);
      }}
    >
      <DragDropProvider>
        <GridPage {...args.page} />
      </DragDropProvider>
    </ViewerProbe>
  </ViewerContext>
{/snippet}

<Story name="default" {args} />

<!-- Page 91 is landscape in the source PDF. -->
<Story
  name="landscape"
  args={{
    ...args,
    page: {
      ...portrait,
      id: 91,
      index: 90,
      height: width * (612 / 792),
      src: pageImageUrl(document, 91, "small").href,
    },
  }}
/>

<!-- A quarter turn swaps the slot's sides, so the upright image is drawn at the
     swapped size before rotating into it. -->
<Story
  name="rotated clockwise"
  args={{
    ...args,
    page: {
      ...portrait,
      width: portrait.height,
      height: portrait.width,
      rotation: 90,
    },
  }}
/>

<Story
  name="rotated 180 degrees"
  args={{ ...args, page: { ...portrait, rotation: 180 } }}
/>

<!-- A 404 while processing means the image was deleted and is being rebuilt. -->
<Story
  name="image missing while processing"
  args={{
    ...args,
    context: { ...args.context, document: { ...document, status: "pending" } },
    page: { ...portrait, src: "https://s3.documentcloud.org/missing.gif" },
  }}
/>

<Story
  name="bulk edit"
  args={{ ...args, context: { ...args.context, mode: "bulk" } }}
/>

<Story
  name="bulk edit, selected"
  args={{ ...args, context: { ...args.context, mode: "bulk" }, selected: true }}
/>
