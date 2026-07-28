<!-- @component
Edit the access level for one note, leaving its other fields alone.

This is the note counterpart to EditAccess, for use in the share dialog.
Editing everything else about a note happens in EditNote.
-->
<script lang="ts">
  import type { Access, Document, Note, Nullable } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Tip from "../common/Tip.svelte";

  import * as notesApi from "$lib/api/notes";
  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    document: Document;
    note: Note;
    onclose?: () => void;
    onsuccess?: (note: Note) => void;
  }

  let { document, note, onclose, onsuccess }: Props = $props();

  // Overridable derived seeds the form from `note`
  let access: Access = $derived(note.access);

  let loading = $state(false);
  let error: Nullable<string> = $state(null);

  async function update(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = null;

    const { data, error: err } = await notesApi.update(
      document.id,
      note.id,
      { access },
      getCsrfToken() ?? "",
    );

    loading = false;

    if (err) {
      error = err.message;
      return;
    }

    if (data) onsuccess?.(data);
    onclose?.();
  }
</script>

<form onsubmit={update}>
  <Flex direction="column" gap={1}>
    {#if error}
      <Tip mode="error">
        {#snippet icon()}<Alert24 />{/snippet}
        <p role="alert">{error}</p>
      </Tip>
    {/if}

    <Field title={$_("edit.fields.access.title")}>
      <AccessLevel
        name="access"
        kind="note"
        bind:selected={access}
        direction="row"
      />
    </Field>

    <Flex class="buttons">
      <Button
        type="submit"
        mode="primary"
        full
        disabled={loading || !note.edit_access}
      >
        {$_("edit.save")}
      </Button>
      <Button full onclick={() => onclose?.()}>
        {$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    width: 100%;
  }
</style>
