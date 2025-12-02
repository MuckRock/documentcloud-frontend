<script lang="ts" context="module">
  import type { Document, Note as NoteType } from "$lib/api/types";

  import { Story, Template } from "@storybook/addon-svelte-csf";
  import NoteContent from "../NoteContent.svelte";

  import doc from "@/test/fixtures/documents/document-expanded.json";

  const document = doc as Document;
  const notes = document.notes as NoteType[];

  const html = `A chance for the Prime Minister and his Deputy to portray themselves as the "<b>action men</b>" of British politics.
  Within a month-and-a-half, <a href="https://en.wikipedia.org/wiki/George_Osborne">George Osborne</a>, the country's new 38 year-old Chancellor of the Exchequor (i.e. the country's Finance Minister)
  will present a budget to Parliament that calls for emergency actions to reduce Britain's forecast $280 billion deficit.`;

  export const meta = {
    title: "Notes / Content",
    component: NoteContent,
    parameters: { layout: "centered" },
  };
</script>

<Template let:args>
  <NoteContent {...args} />
</Template>

<Story name="Default" args={{ note: { ...notes[2], content: html } }} />
<Story
  name="Plain Text"
  args={{
    note: {
      ...notes[0],
      content: "This is a simple plain text note without any HTML formatting.",
    },
  }}
/>
<Story
  name="Rich HTML"
  args={{
    note: {
      ...notes[0],
      content:
        '<p>This note contains <strong>bold text</strong>, <em>italic text</em>, and <a href="https://example.com">links</a>.</p><ul><li>Item 1</li><li>Item 2</li></ul>',
    },
  }}
/>
