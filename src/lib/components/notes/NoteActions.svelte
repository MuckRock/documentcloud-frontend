<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { Document, Note } from "@/lib/api/types";
  import { getViewerHref } from "@/lib/utils/viewer";
  import Button from "../common/Button.svelte";
  import { Globe16, Lock16, Pencil16, People16, Share16 } from "svelte-octicons";

  export let doc: Document;
  export let note: Note;
  export let canEdit: boolean = false;
  export let canShare: boolean = true;
  export let onShare: () => void;
  
  $: edit_link = getViewerHref({ document: doc, note, mode: "annotating" });

  const access = {
    private: {
      value: $_("access.private.value"),
      title: $_("access.private.title"),
      icon: Lock16,
    },
    organization: {
      value: $_("access.organization.value"),
      title: $_("access.organization.title"),
      icon: People16,
    },
    public: {
      value: $_("access.public.value"),
      title: $_("access.public.title"),
      icon: Globe16,
    },
  };
</script>

<div class="actions">
  <span class="access {note.access}">
    <svelte:component this={access[note.access].icon} />
    {$_(`access.${access[note.access].value}.title`)}
  </span>
  {#if canEdit}
    <Button
      ghost
      minW={false}
      mode="primary"
      size="small"
      href={edit_link}
    >
      <Pencil16 />
      {$_("dialog.edit")}
    </Button>
  {/if}
  {#if canShare}
    <Button
      ghost
      minW={false}
      mode="primary"
      size="small"
      on:click={onShare}
    >
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