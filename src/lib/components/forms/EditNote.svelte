<!-- @component
Add or edit a note.

This form deals with everything except coordinates, which should be passed in as a 4-tuple.
Positioning and generating coordinates should happen outside of this form.
-->
<script lang="ts">
  import type { Bounds, Document, Maybe, Note } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { _ } from "svelte-i18n";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Button from "../common/Button.svelte";
  import Field from "../inputs/Field.svelte";
  import Flex from "../common/Flex.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { canonicalUrl } from "$lib/api/documents";

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
  let canonical = $derived(canonicalUrl(document));
  let action = $derived(
    note.id
      ? new URL("?/updateAnnotation", canonical).href
      : new URL("?/createAnnotation", canonical).href,
  );
  let page_level = $derived(!coords || coords.every((c) => !Boolean(c)));

  function onSubmit({ submitter }) {
    submitter.disabled = true;
    return ({ result, update }) => {
      if (result.type === "success") {
        onsuccess?.(result.data.note);
        update(result);
        onclose?.();
      }
    };
  }
</script>

<form {action} method="post" class:page_level use:enhance={onSubmit}>
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

    {#if note.id}
      <input type="hidden" name="id" value={note.id} />
    {/if}
    <input
      type="hidden"
      name="page_number"
      value={note.page_number || page_number}
    />
    <input type="hidden" name="coords" value={JSON.stringify(coords)} />

    <Flex class="buttons" justify="between">
      <Flex>
        <Button type="submit" mode="primary">{$_("annotate.save")}</Button>
        <Button type="reset" onclick={() => onclose?.()}
          >{$_("annotate.cancel")}
        </Button>
      </Flex>

      {#if note.id}
        <Button
          type="submit"
          mode="danger"
          formaction={new URL("?/deleteAnnotation", canonical).href}
        >
          {$_("dialog.delete")}
        </Button>
      {/if}
    </Flex>
  </Flex>
</form>
