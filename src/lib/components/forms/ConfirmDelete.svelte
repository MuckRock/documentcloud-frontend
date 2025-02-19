<!-- @component
Confirm deletion or one or more documents.
-->
<script lang="ts">
  import type { APIError, Document, Maybe } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24, Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";
  import { canonicalUrl, deleted } from "$lib/api/documents";
  import { getCurrentUser } from "$lib/utils/permissions";

  const me = getCurrentUser();

  // one document or a list of IDs
  export let documents: Document[] = [];

  const dispatch = createEventDispatcher();

  let error: Maybe<APIError<null>> = undefined;

  $: ids = documents.map((d) => d.id);
  $: bulk = documents.length !== 1; // if it's zero, handle that elsewhere
  $: count = documents.length;
  $: disabled = count > MAX_EDIT_BATCH || count === 0 || !$me;
  $: action = bulk
    ? "/documents/?/delete"
    : documents[0]
      ? canonicalUrl(documents[0]).href + "?/delete"
      : "";

  function onSubmit({ submitter, cancel }) {
    submitter.disabled = true;
    if (!$me) {
      return cancel();
    }
    return ({ result, update }) => {
      if (result.type === "success") {
        ids.forEach((d) => $deleted.add(String(d)));
        dispatch("close");
      } else {
        error = result.data.error;
      }
      dispatch("close");
      update(result);
      submitter.disabled = false;
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
      <Button on:click={() => dispatch("close")}>
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
