<script lang="ts">
  import type { Document, ViewerMode, Note } from "$lib/api/types.js";
  import { setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  export let data;

  const activeNote: Writable<Note> = writable(null);
  const currentPage: Writable<number> = writable(1);
  const currentMode: Writable<ViewerMode> = writable(data.mode);

  setContext<Document>("document", data.document);
  // stores we need deeper in the component tree, available via context
  setContext("activeNote", activeNote);
  setContext("currentPage", currentPage);
  setContext("currentMode", currentMode);
</script>
