<!-- @component
Add or edit a note.

This form deals with everything except coordinates, which should be passed in as a 4-tuple.
Positioning and generating coordinates should happen outside of this form.
-->
<script lang="ts">
  import type { Bounds, Document, Maybe, Note, Nullable } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import * as notesApi from "$lib/api/notes";
  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    document: Document;
    note?: Partial<Note>; // for updating
    page_number?: Maybe<number>;
    onclose?: () => void;
    onsuccess?: (note: Note) => void;
  }

  let {
    document,
    note = $bindable({ title: "", content: "", access: "private" }),
    page_number = note.page_number,
    onclose,
    onsuccess,
  }: Props = $props();

  let coords = $derived([
    note.x1,
    note.x2,
    note.y1,
    note.y2,
  ] as Partial<Bounds>);
  let page_level = $derived(!coords || coords.every((c) => !Boolean(c)));

  let loading = $state(false);
  let error: Nullable<string> = $state(null);

  /**
   * Create a new note on this document, directly from the browser.
   */
  async function create(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = null;

    const csrf_token = getCsrfToken() ?? "";
    const [x1, x2, y1, y2] = coords;

    const { data, error: err } = await notesApi.create(
      document.id,
      {
        title: note.title,
        content: note.content ?? "",
        access: note.access,
        page_number: note.page_number ?? page_number ?? undefined,
        x1,
        x2,
        y1,
        y2,
      },
      csrf_token,
    );

    loading = false;

    if (err) {
      error = err.message;
      return;
    }

    if (data) onsuccess?.(data);
    onclose?.();
  }

  /**
   * Update an existing note, directly from the browser.
   */
  async function update(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    error = null;

    const csrf_token = getCsrfToken() ?? "";

    const { data, error: err } = await notesApi.update(
      document.id,
      note.id!,
      {
        title: note.title,
        content: note.content ?? "",
        access: note.access,
      },
      csrf_token,
    );

    loading = false;

    if (err) {
      error = err.message;
      return;
    }

    if (data) onsuccess?.(data);
    onclose?.();
  }

  /**
   * Delete a note, directly from the browser.
   */
  async function remove() {
    loading = true;
    error = null;

    const csrf_token = getCsrfToken() ?? "";

    const { error: err } = await notesApi.remove(
      document.id,
      note.id!,
      csrf_token,
    );

    loading = false;

    if (err) {
      error = err.message;
      return;
    }

    onclose?.();
  }
</script>

<form class:page_level onsubmit={note.id ? update : create}>
  <Flex direction="column" gap={1}>
    <Field title={$_("annotate.fields.title")} required>
      <Text
        name="title"
        placeholder={$_("annotate.fields.title")}
        bind:value={note.title}
        required
      />
    </Field>
    <Field title={$_("annotate.fields.content")}>
      <TextArea name="content" bind:value={note.content} />
    </Field>

    <AccessLevel name="access" bind:selected={note.access} direction="row" />

    {#if error}
      <p class="error" role="alert">{error}</p>
    {/if}

    <Flex class="buttons" justify="between">
      <Flex>
        <Button type="submit" mode="primary" disabled={loading}>
          {$_("annotate.save")}
        </Button>
        <Button type="reset" disabled={loading} onclick={() => onclose?.()}>
          {$_("annotate.cancel")}
        </Button>
      </Flex>

      {#if note.id}
        <Button type="button" mode="danger" disabled={loading} onclick={remove}>
          {$_("dialog.delete")}
        </Button>
      {/if}
    </Flex>
  </Flex>
</form>

<style>
  .error {
    margin: 0;
    color: var(--red-3, #cf2e2e);
    font-size: 0.875rem;
  }
</style>
