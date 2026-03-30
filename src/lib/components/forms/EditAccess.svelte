<!-- @component
Edit the access level for one document.
Usually this will be rendered inside a modal, but it doesn't have to be.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    Document,
    Maybe,
    APIError,
    ValidationError,
  } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import AccessLevel from "../inputs/AccessLevel.svelte";
  import Field from "../inputs/Field.svelte";
  import Tip from "../common/Tip.svelte";

  import { canonicalUrl, edited } from "$lib/api/documents";
  import { toDatetimeLocal } from "$lib/utils/date";

  interface Props {
    document: Document;
    error?: Maybe<APIError<ValidationError>>;
    children?: Snippet;
    onclose?: () => void;
  }

  let {
    document,
    error = $bindable(undefined),
    children,
    onclose,
  }: Props = $props();

  let action = $derived(new URL("?/edit", canonicalUrl(document)).href);

  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let publish_at: string | undefined = $derived(
    document.publish_at
      ? toDatetimeLocal(new Date(document.publish_at))
      : undefined,
  );

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ submitter, formData }) {
    submitter.disabled = true;
    const pa = formData.get("publish_at");
    if (pa) formData.set("publish_at", new Date(pa as string).toISOString());
    return async ({ result, update }) => {
      if (result.type === "failure") {
        submitter.disabled = false;
        console.error(result);
        error = result.data;
      }

      if (result.type === "success") {
        // save edits
        edited.update((m) => {
          const d = result.data.document;
          d.access = formData.get("access"); // this is often a step behind, so force it here
          m.set(String(d.id), d);
          return m;
        });
        update(result);
        onclose?.();
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <!-- Add any header and messaging using this slot -->
    {@render children?.()}

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

    {#if document.access !== "public"}
      <Field
        title={$_("edit.fields.publish_at.title")}
        description={$_("edit.fields.publish_at.description", { values: { timezone } })}
      >
        <input
          type="datetime-local"
          name="publish_at"
          min={toDatetimeLocal(new Date())}
          value={publish_at}
        />
      </Field>
    {/if}

    <Flex class="buttons">
      <Button
        type="submit"
        mode="primary"
        full
        disabled={!document.edit_access}
      >
        {$_("edit.save")}
      </Button>
      <Button full on:click={() => onclose?.()}>
        {$_("edit.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    width: 100%;
  }

  input[name="publish_at"] {
    display: flex;
    padding: 0.375rem 0.75rem;
    justify-content: left;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-3, hwb(205 60% 30%));
    background: var(--white, #fff);
    box-shadow: 0px 2px 0px 0px var(--gray-2, #d8dee2) inset;

    color: var(--gray-5, #233944);
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: var(--font-family, var(--font-sans, "Source Sans Pro"));
    font-size: var(--font-size, var(--font-md, 1rem));
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
  input[name="publish_at"]::placeholder {
    color: var(--gray-3, #99a8b3);
  }

  input[name="publish_at"]:disabled {
    color: var(--gray-3);
  }
</style>
