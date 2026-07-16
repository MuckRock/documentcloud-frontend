<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import PageActions from "../PageActions.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  // The fixture has `edit_access: false`; override to expose the
  // note/section actions that only appear for editors.
  const editable = { ...document, edit_access: true } as Document;

  const { Story } = defineMeta({
    title: "Viewer / Page Actions",
    component: PageActions,
    parameters: { layout: "centered" },
    render: template,
  });

  // A page wide enough (> 32rem) shows the inline actions; a narrower
  // page collapses them into a kebab dropdown.
  const WIDE = 640;
  const NARROW = 320;

  let args = {
    props: {
      document,
      page_number: 1,
      pageWidth: WIDE,
    },
  };
</script>

{#snippet template(args)}
  <PageActions {...args.props} />
{/snippet}

<Story
  name="Wide, editor"
  args={{
    ...args,
    props: { ...args.props, document: editable, pageWidth: WIDE },
  }}
/>

<Story
  name="Wide, viewer"
  args={{ ...args, props: { ...args.props, document, pageWidth: WIDE } }}
/>

<Story
  name="Narrow, editor"
  args={{
    ...args,
    props: { ...args.props, document: editable, pageWidth: NARROW },
  }}
/>
