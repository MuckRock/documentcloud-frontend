<!-- @component
Add or edit a note.

This form deals with everything except coordinates, which should be passed in as a 4-tuple.
Positioning and generating coordinates should happen outside of this form.
-->
<script lang="ts">
  import type { Bounds, Document, Note } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Button from "../common/Button.svelte";
  import Card from "../common/Card.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;
  export let note: Partial<Note> = {}; // for updating
  export let page_number: number = note.page_number;

  const dispatch = createEventDispatcher();

  $: coords = [note.x1, note.x2, note.y1, note.y2];
  $: canonical = canonicalUrl(document);
  $: action = note.id
    ? new URL("annotate/?/update", canonical).href
    : new URL("annotate/?/create", canonical).href;
  $: page_level = !coords || coords.every((c) => c === null);

  function onSubmit({ formElement }) {
    formElement.disabled = true;
    return ({ result }) => {
      if (result.type === "success") {
        dispatch("close");
        invalidate(`document:${document.id}`);
      }
    };
  }
</script>

<form {action} method="post" class:page_level use:enhance={onSubmit}>
  <Card>
    <Field title={$_("annotate.fields.title")} required>
      <Text
        name="title"
        placeholder={$_("annotate.fields.title")}
        bind:value={note.title}
      />
    </Field>
    <Field title={$_("annotate.fields.content")}>
      <TextArea name="content" bind:value={note.content} />
    </Field>

    <AccessLevel name="access" bind:selected={note.access} direction="row" />

    {#if note.id}
      <input type="hidden" name="id" value={note.id} />
    {/if}
    <input
      type="hidden"
      name="page_number"
      value={note.page_number || page_number}
    />
    <input type="hidden" name="coords" value={JSON.stringify(coords)} />

    <Flex class="buttons">
      <Button type="submit" mode="primary">{$_("annotate.save")}</Button>
      <Button type="reset" on:click={() => dispatch("close")}
        >{$_("annotate.cancel")}
      </Button>

      {#if note.id}
        <Button
          type="submit"
          mode="danger"
          formaction={new URL("annotate/?/delete", canonical).href}
          >{$_("annotate.delete")}
        </Button>
      {/if}
    </Flex>
  </Card>
</form>
