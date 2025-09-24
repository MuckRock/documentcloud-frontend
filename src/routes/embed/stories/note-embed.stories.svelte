<script context="module" lang="ts">
  import type { Note, ViewerMode } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import NoteEmbed from "../documents/[id]/annotations/[note_id]/+page.svelte";

  import { documentExpanded } from "@/test/fixtures/documents";

  const notes = documentExpanded.notes ?? [];
  const note = notes[0] as Note;
  const bigNote = notes[1] as Note;

  export const meta = {
    title: "Embed / Note",
    component: NoteEmbed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const data = {
    note: note as Note,
    document: documentExpanded,
    embed: true,
    mode: "document" as ViewerMode,
    me: null,
    org: null,
    user_orgs: Promise.resolve([]),
    org_users: Promise.resolve([]),
    breadcrumbs: [],
    tipOfDay: null,
    settings: {},
  };
</script>

<Story name="default">
  <div class="vh100">
    <NoteEmbed {data} />
  </div>
</Story>

<Story name="bigger note">
  <NoteEmbed data={{ ...data, note: bigNote }} />
</Story>

<style>
  .vh100 {
    height: 100vh;
    margin: 0;
  }
</style>
