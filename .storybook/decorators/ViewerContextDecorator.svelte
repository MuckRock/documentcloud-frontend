<script lang="ts">
  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";
  import type { Note, ViewerMode } from "$lib/api/types";
  const currentMode: Writable<ViewerMode> = writable("document");
  const currentPage: Writable<number> = writable(1);
  const activeNote: Writable<Note> = writable(null);
  setContext("currentMode", currentMode);
  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);
</script>

<slot />
