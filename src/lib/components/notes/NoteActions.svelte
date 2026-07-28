<script lang="ts">
  import type { Document, Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, Share16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import { getLevel } from "$lib/utils/access";
  import { getViewerHref } from "$lib/utils/viewer";

  interface Props {
    doc: Document;
    note: Note;
    canEdit?: boolean;
    canShare?: boolean;
    onShare: () => void;
  }

  let {
    doc,
    note,
    canEdit = false,
    canShare = true,
    onShare,
  }: Props = $props();

  let edit_link = $derived(
    getViewerHref({ document: doc, note, mode: "annotating" }),
  );

  let level = $derived(getLevel(note.access, "note")!);
  const Icon = $derived(level.icon);
</script>

<div class="actions">
  <span class="access {note.access}">
    <Icon height="1rem" width="1rem" />
    {$_(level.title)}
  </span>
  {#if canEdit}
    <Button ghost minW={false} mode="primary" size="small" href={edit_link}>
      <Pencil16 />
      {$_("dialog.edit")}
    </Button>
  {/if}
  {#if canShare}
    <Button ghost minW={false} mode="primary" size="small" onclick={onShare}>
      <Share16 />
      {$_("dialog.share")}
    </Button>
  {/if}
</div>

<style>
  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--font-md, 1rem);
  }

  span.access {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }

  span.access.public {
    fill: var(--note-public);
    color: color-mix(in srgb, var(--note-public), var(--gray-5));
  }

  span.access.organization {
    fill: var(--note-org);
    color: color-mix(in srgb, var(--note-org), var(--gray-5));
  }

  span.access.private {
    fill: var(--note-private);
    color: color-mix(in srgb, var(--note-private), var(--gray-5));
  }
</style>
