<!-- @component
Confirm deletion or one or more documents.
-->
<script lang="ts">
  import type { APIError, Document, Maybe } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";

  import { _ } from "svelte-i18n";
  import { Alert24, Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";
  import { canonicalUrl, deleted } from "$lib/api/documents";
  import { getCurrentUser } from "$lib/utils/permissions";
  import { searchUrl, userDocs } from "$lib/utils/search";

  const me = getCurrentUser();

  interface Props {
    // one document or a list of IDs
    documents?: Document[];
    onclose?: () => void;
  }

  let { documents = [], onclose }: Props = $props();

  let error: Maybe<APIError<null>> = $state(undefined);

  let ids = $derived(documents.map((d) => d.id));
  let bulk = $derived(documents.length !== 1); // if it's zero, handle that elsewhere
  let count = $derived(documents.length);
  let disabled = $derived(count > MAX_EDIT_BATCH || count === 0 || !$me);
  let action = $derived(
    bulk
      ? "/documents/?/delete"
      : documents[0]
        ? canonicalUrl(documents[0]).href + "?/delete"
        : "",
  );

  function onSubmit({ submitter, cancel }) {
    submitter.disabled = true;
    if (!$me) {
      return cancel();
    }
    return ({ result }) => {
      switch (result.type) {
        case "error":
          error = result.data.error;
          submitter.disabled = false;
          break;

        case "success":
          deleted.update((s) => {
            ids.forEach((d) => s.add(String(d)));
            return s;
          });
          onclose?.();
          submitter.disabled = false;
          break;

        case "redirect":
          deleted.update((s) => {
            ids.forEach((d) => s.add(String(d)));
            return s;
          });
          // don't redirect for bulk deletes
          if (count === 1) {
            // go back home for single deletes
            goto(searchUrl(userDocs($me)), { invalidateAll: true });
          }
          onclose?.();
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    <ShowSize size={count}>
      <div>
        <p>{$_("delete.really", { values: { n: count } })}</p>
        <p>{$_("delete.continue", { values: { n: count } })}</p>
      </div>
      <Tip mode="danger" slot="oversize">
        <Alert24 slot="icon" />
        {$_("delete.toomany", { values: { n: MAX_EDIT_BATCH } })}
      </Tip>
      <p slot="empty">{$_("delete.none")}</p>
    </ShowSize>

    {#if error}
      <p class="error">
        <span>{$_("delete.error")}:</span>
        {error.message}
      </p>
    {/if}

    {#if bulk}
      <input type="hidden" name="documents" value={ids.join(",")} />
    {/if}

    <Flex>
      <Button type="submit" mode="danger" {disabled}>
        <Trash16 />
        {$_("delete.confirm")}
      </Button>
      <Button on:click={() => onclose?.()}>
        {$_("delete.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>

<style>
  form {
    color: var(--gray-5, #233944);
    width: 100%;
  }
</style>
