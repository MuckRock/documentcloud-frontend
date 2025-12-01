<!-- @component
Edit the access level for one document.
Usually this will be rendered inside a modal, but it doesn't have to be.
-->
<script lang="ts">
  import type {
    Document,
    Maybe,
    APIError,
    ValidationError,
  } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Field from "../inputs/Field.svelte";
  import Tip from "../common/Tip.svelte";

  import { canonicalUrl, edited } from "$lib/api/documents";

  export let document: Document;
  export let error: Maybe<APIError<ValidationError>> = undefined;

  const dispatch = createEventDispatcher();

  $: action = new URL("?/edit", canonicalUrl(document)).href;

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ submitter }) {
    submitter.disabled = true;

    return async ({ result, update }) => {
      submitter.disabled = false;
      if (result.type === "failure") {
        console.error(result);
        error = result.data;
      }

      if (result.type === "success") {
        // save edits
        edited.update((m) => {
          const d = result.data.document;
          m.set(String(d.id), d);
          return m;
        });
        update(result);
        dispatch("close");
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <!-- Add any header and messaging using this slot -->
    <slot />

    {#if error}
      <Tip mode="error">
        <Alert24 slot="icon" />
        <p>{error.message}</p>
        {#if Object.keys(error.errors ?? {}).length}
          <ul>
            {#each Object.entries(error.errors ?? {}) as [field, errs]}
              <li>
                <strong>{field}</strong>: {errs.join(";")}
              </li>
            {/each}
          </ul>
        {/if}
      </Tip>
    {/if}

    <Field
      title={$_("edit.fields.access.title")}
      description={$_("edit.fields.access.description")}
    >
      <AccessLevel name="access" selected={document.access} direction="row" />
    </Field>

    <Flex class="buttons">
      <Button type="submit" mode="primary" full>{$_("edit.save")}</Button>
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
