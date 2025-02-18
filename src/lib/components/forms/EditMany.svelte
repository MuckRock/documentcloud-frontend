<!-- @component
Edit metadata for many documents. This touches all top-level data.
Usually this will be rendered inside a modal, but it doesn't have to be.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Field from "../inputs/Field.svelte";
  import Switch from "../inputs/Switch.svelte";
  import Text from "../inputs/Text.svelte";
  import TextArea from "../inputs/TextArea.svelte";
  import Tip from "../common/Tip.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";

  export let documents: Document[];

  const dispatch = createEventDispatcher();

  const action = "/documents/?/edit";

  $: ids = documents?.map((d) => d.id) ?? [];
  $: disabled = documents.length < 1 || documents.length >= MAX_EDIT_BATCH;

  function onSubmit() {
    dispatch("close");
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <!-- Add any header and messaging using this slot -->
    <slot />

    {#if documents.length < 1}
      <Tip
        --background-color="var(--caution)"
        --color="var(--gray-1)"
        --fill="var(--gray-1)"
      >
        <Alert24 slot="icon" />
        {$_("edit.nodocs")}
      </Tip>
    {:else if documents.length >= MAX_EDIT_BATCH}
      <Tip
        --background-color="var(--caution)"
        --color="var(--gray-1)"
        --fill="var(--gray-1)"
      >
        <Alert24 slot="icon" />
        {$_("edit.toomany", { values: { n: MAX_EDIT_BATCH } })}
      </Tip>
    {/if}

    <Field
      title={$_("edit.fields.description")}
      description={$_("edit.allowedHTML")}
    >
      <TextArea name="description" />
    </Field>

    <Field title={$_("edit.fields.source")}>
      <Text name="source" />
    </Field>
    <Flex gap={2}>
      <Field title={$_("edit.fields.published_url")}>
        <Text name="published_url" />
      </Field>
      <Field title={$_("edit.fields.related_article")}>
        <Text name="related_article" />
      </Field>
    </Flex>

    <hr class="divider" />

    <Field title={$_("edit.fields.noindex")} inline>
      <Switch name="noindex" />
    </Field>

    <Field
      title={$_("edit.fields.access.title")}
      description={$_("edit.fields.access.description")}
    >
      <AccessLevel name="access" direction="row" />
    </Field>

    <input type="hidden" name="documents" value={ids.join(",")} />

    <Flex class="buttons">
      <Button type="submit" mode="primary" full {disabled}>
        {$_("edit.save")}
      </Button>
      <Button full on:click={() => dispatch("close")}>
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
