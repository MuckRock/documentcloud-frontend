<!-- @component
A container for page-level annotation, handling markup and interaction.
-->
<script lang="ts">
  import type { Document, Section } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Comment16, ListOrdered16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";

  import Modal from "../layouts/Modal.svelte";
  import Portal from "../layouts/Portal.svelte";

  import EditNote from "../forms/EditNote.svelte";
  import EditSections from "../forms/EditSections.svelte";

  export let document: Document;
  export let page_number: number; // zero-indexed
  export let section: Section = undefined;

  let editSection = false;
  let pageNote = false;

  function close() {
    editSection = false;
    pageNote = false;
  }
</script>

<div>
  {#if document.edit_access}
    <Action icon={Comment16} on:click={() => (pageNote = true)}>
      {$_("annotate.cta.add-note")}
    </Action>

    <Action icon={ListOrdered16} on:click={() => (editSection = true)}>
      {#if section}
        {$_("annotate.cta.edit-section")}
      {:else}
        {$_("annotate.cta.add-section")}
      {/if}
    </Action>
  {/if}
</div>

{#if editSection}
  <Portal>
    <Modal on:close={close}>
      <h2 slot="title">
        {#if section}
          {$_("annotate.cta.edit-section")}
        {:else}
          {$_("annotate.cta.add-section")}
        {/if}
      </h2>
      <EditSections {document} on:close={close} {section} />
    </Modal>
  </Portal>
{/if}

{#if pageNote}
  <Portal>
    <Modal on:close={close}>
      <h2 slot="title">
        {$_("annotate.cta.add-note")}
      </h2>
      <EditNote {document} {page_number} on:close={close} />
    </Modal>
  </Portal>
{/if}
