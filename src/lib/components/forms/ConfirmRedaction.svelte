<!-- @component
Tiny form to confirm that you really want to run a set of redactions,
which you can't undo.

This almost certainly lives in a modal.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidate, goto } from "$app/navigation";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Check16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import {
    pending,
    redactions,
  } from "$lib/components/viewer/RedactionLayer.svelte";
  import { canonicalUrl } from "$lib/api/documents";
  import { load } from "$lib/components/processing/ProcessContext.svelte";

  export let document: Document;

  const dispatch = createEventDispatcher();

  let error: string;

  $: action = new URL("?/redact", canonicalUrl(document)).href;

  function onSubmit({ formElement, submitter }) {
    formElement.disabled = true;
    submitter.disabled = true;

    return async ({ result }) => {
      // `result` is an `ActionResult` object
      if (result.type === "failure") {
        console.error(result);
        error = result.data.error;
      }

      if (result.type === "success") {
        // need to invalidate before navigating
        await invalidate(`document:${document.id}`);
        $redactions = [];
        pending.update((p) => {
          p[document.id] = result.data.redactions;
          return p;
        });
        load();
        goto("?mode=document");
        dispatch("close");
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
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
        {$_("redact.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    padding: 1rem;
  }

  .error {
    color: var(--error, var(--red-3));
  }
</style>
