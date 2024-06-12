<!-- @component
Edit the metadata for one document. This touches all top-level data.
Usually this will be rendered inside a modal, but it doesn't have to be.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Premium from "../common/Premium.svelte";

  import Field from "../inputs/Field.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/edit", canonicalUrl(document)).href;
</script>

<form {action} method="post">
  <Flex direction="column">
    <header>
      <h2>{$_("edit.title")}</h2>
    </header>
    <Field title="Title">
      <Text name="title" value={document.title} required />
    </Field>
    <Field title="Description">
      <TextArea name="description" value={document.description} />
    </Field>

    <Field title="Source">
      <Text name="source" value={document.source} />
    </Field>

    <Field title="Published URL">
      <Text name="published_url" value={document.published_url.toString()} />
    </Field>

    <Field title="Related article">
      <Text
        name="related_article"
        value={document.related_article.toString()}
      />
    </Field>

    <div class="buttons">
      <Button type="submit" mode="primary">Save</Button>
      <Button on:click={(e) => dispatch("close")}>Cancel</Button>
    </div>
  </Flex>
</form>
