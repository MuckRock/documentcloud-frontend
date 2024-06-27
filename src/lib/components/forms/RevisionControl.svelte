<!-- @component Enable or disable revisions for a document. -->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Field from "../inputs/Field.svelte";
  import Switch from "../inputs/Switch.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;

  let formRef: HTMLFormElement;

  $: action = canonicalUrl(document).href + "?/edit";

  function onSubmit({ formData }) {
    const enabled = formData.get("revision_control") === "on";
    formData.set("revision_control", enabled);

    return ({ result, update }) => {
      invalidate(`document:${document.id}`);
      update(result);
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit} bind:this={formRef}>
  <Flex direction="column" gap={1} align="end">
    <Field inline title={$_("dialogRevisionsDialog.controlLabel")}>
      <Switch name="revision_control" checked={document.revision_control} on:change={() => formRef.submit()} />
    </Field>
    <Flex class="buttons">
      <Button size="small" type="submit" mode="primary">{$_("dialog.save")}</Button>
    </Flex>
  </Flex>
</form>
