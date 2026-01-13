<script lang="ts">
  import type { Note } from "$lib/api/types";

  interface Props {
    note: Note;
    active?: boolean;
    onclick?: () => void;
  }

  let { note, active = false, onclick }: Props = $props();
</script>

<button
  class="dc-embed-note"
  class:public={note.access === "public"}
  class:organization={note.access === "organization"}
  class:private={note.access === "private"}
  class:active
  style="left: {note.x1 * 100}%; top: {note.y1 * 100}%; right: {(1 - note.x2) *
    100}%; bottom: {(1 - note.y2) * 100}%"
  onclick={onclick}
  title={note.title}
></button>

<style>
  .dc-embed-note {
    display: inline-block;
    position: absolute;
    background: rgba(255, 255, 0, 0.2);
    cursor: pointer;
  }

  .dc-embed-note:hover {
    box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
  }

  .dc-embed-note.public {
    border: var(--annotationBorderWidth, 3px) solid var(--note-public);
    background: rgba(var(--annotationBorder), 0.2);
  }

  .dc-embed-note.organization {
    border: var(--annotationBorderWidth, 3px) solid var(--note-org);
    background: rgba(var(--note-org), 0.2);
  }

  .dc-embed-note.private {
    border: var(--annotationBorderWidth, 3px) solid var(--note-private);
    background: rgba(var(--note-private), 0.2);
  }

  .dc-embed-note.active {
    background: transparent;
    border: none;
    box-shadow: 1px 2px 7px rgba(0, 0, 0, 0.2);
  }
</style>
