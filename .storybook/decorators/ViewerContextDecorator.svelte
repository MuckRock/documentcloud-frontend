<script lang="ts">
  import type { Note, ViewerMode } from "../../src/lib/api/types";

  import { setContext } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let mode: ViewerMode = "document";

  const currentMode: Writable<ViewerMode> = writable(mode);
  const currentPage: Writable<number> = writable(1);
  const activeNote: Writable<Note> = writable(null);

  setContext("currentMode", currentMode);
  setContext("currentPage", currentPage);
  setContext("activeNote", activeNote);
</script>

<slot />
