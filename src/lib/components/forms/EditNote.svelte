<!-- @component
Add or edit a note.

This form deals with everything except coordinates, which should be passed in as a 4-tuple.
Positioning and generating coordinates should happen outside of this form.
-->
<script lang="ts">
  import type { Bounds, Document, Note } from "$lib/api/types";

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

  export let coords: Bounds = undefined;

  const dispatch = createEventDispatcher();

  $: action = new URL("annotate/?/update", canonicalUrl(document)).href;
  $: page_level = !coords || coords.every((c) => c === null);
</script>

<form {action} method="post" class:page_level>
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

    <input
      type="hidden"
      name="page_number"
      value={note.page_number || page_number}
    />
    <input type="hidden" name="coords" value={JSON.stringify(coords)} />

    <Flex class="buttons">
      <Button type="submit" mode="primary">{$_("annotate.save")}</Button>
      <Button type="reset" on:click={(e) => dispatch("close")}
        >{$_("annotate.cancel")}</Button
      >
    </Flex>
  </Card>
</form>
