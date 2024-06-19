<!-- @component
Tiny form to confirm that you really want to run a set of redactions,
which you can't undo.

This almost certainly lives in a modal.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Check16, Undo16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { redactions } from "$lib/components/documents/RedactionPane.svelte";
  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;

  const dispatch = createEventDispatcher();

  let error: string;

  $: action = canonicalUrl(document).pathname + "?/redact";

  function onSubmit({ formElement, formData, action, cancel, submitter }) {
    formElement.disabled = true;
    submitter.disabled = true;

    return async ({ result, update }) => {
      // `result` is an `ActionResult` object
      // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      console.log(result);

      if (result.type === "failure") {
        error = result.data.error;
      }

      if (result.type === "success") {
        dispatch("close");
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column">
    <h2>{$_("redact.confirm")}</h2>
    <p>{$_("redact.really")}</p>

    {#if error}
      <p class="error">
        <span>{$_("redact.error")}:</span>
        {error}
      </p>
    {/if}

    <input
      type="hidden"
      name="redactions"
      value={JSON.stringify($redactions)}
    />

    <Flex>
      <Button type="submit" mode="primary">
        <Check16 />
        {$_("redact.confirm")}
      </Button>
      <Button on:click={() => dispatch("close")}>
        <Undo16 />
        {$_("redact.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  .error {
    color: var(--error, red);
  }
</style>
