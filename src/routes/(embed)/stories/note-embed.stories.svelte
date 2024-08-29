<script context="module" lang="ts">
  import type { Document, Note, ViewerMode } from "$lib/api/types";

  // legacy css
  import "@/style/variables.css";
  import "@/style/global.css";

  import { Story } from "@storybook/addon-svelte-csf";
  import NoteEmbed from "../documents/[id]/annotations/[note_id]/+page.svelte";

  import document from "@/test/fixtures/documents/document-expanded.json";
  import note from "@/test/fixtures/notes/note-expanded.json";
  import notes from "@/test/fixtures/notes/notes-expanded.json";

  export const meta = {
    title: "Embed / Note",
    component: NoteEmbed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const bigNote = notes.results[1] as Note;

  const data = {
    note: note as Note,
    document: document as Document,
    embed: true,
    mode: "document" as ViewerMode,
    me: null,
    org: null,
    user_orgs: Promise.resolve([]),
    org_users: Promise.resolve([]),
    breadcrumbs: [],
    tipOfDay: null,
  };
</script>

<Story name="default">
  <NoteEmbed {data} />
</Story>

<Story name="bigger note">
  <NoteEmbed data={{ ...data, note: bigNote }} />
</Story>
