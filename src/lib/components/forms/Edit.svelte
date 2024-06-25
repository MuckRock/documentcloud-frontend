<!-- @component
Edit the metadata for one document. This touches all top-level data.
Usually this will be rendered inside a modal, but it doesn't have to be.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/edit", canonicalUrl(document)).href;

  function onSubmit() {
    dispatch("close");
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <!-- Add any header and messaging using this slot -->
    <slot />
    <Field title={$_("edit.fields.title")}>
      <Text name="title" value={document.title} required autofocus />
    </Field>
    <Field
      title={$_("edit.fields.description")}
      description={$_("edit.allowedHTML")}
    >
      <TextArea name="description" value={document.description} />
    </Field>

    <Field title={$_("edit.fields.source")}>
      <Text name="source" value={document.source} />
    </Field>
    <Flex gap={2}>
      <Field title={$_("edit.fields.published_url")}>
        <Text name="published_url" value={document.published_url.toString()} />
      </Field>
      <Field title={$_("edit.fields.related_article")}>
        <Text
          name="related_article"
          value={document.related_article.toString()}
        />
      </Field>
    </Flex>

    <hr class="divider" />

    <Field
      title={$_("edit.fields.access.title")}
      description={$_("edit.fields.access.description")}
    >
      <AccessLevel name="access" selected={document.access} direction="row" />
    </Field>

    <Flex class="buttons">
      <Button type="submit" mode="primary" full>{$_("edit.save")}</Button>
      <Button full on:click={(e) => dispatch("close")}
        >{$_("edit.cancel")}</Button
      >
    </Flex>
  </Flex>
</form>

<style>
  form {
    width: 100%;
  }
</style>
