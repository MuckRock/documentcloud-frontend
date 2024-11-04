<!-- @component
Confirm deletion or one or more documents.
-->
<script lang="ts">
  import type { Document, Maybe } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl, deleted } from "$lib/api/documents";
  import { getCurrentUser } from "$lib/utils/permissions";

  const me = getCurrentUser();

  // one document or a list of IDs
  export let documents: Document[] = [];

  const dispatch = createEventDispatcher();

  let error: Maybe<string> = undefined;

  $: ids = documents.map((d) => d.id);
  $: bulk = documents.length !== 1; // if it's zero, handle that elsewhere
  $: count = documents.length;
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
        console.error(result);
      }
      dispatch("close");
      update(result);
      submitter.disabled = false;
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
  <Flex direction="column" gap={1}>
    {#if count}
      <p>{$_("delete.really", { values: { n: count } })}</p>
      <p>{$_("delete.continue", { values: { n: count } })}</p>
    {:else}
      <p>{$_("delete.none")}</p>
    {/if}

    {#if error}
      <p class="error">
        <span>{$_("delete.error")}:</span>
        {error}
      </p>
    {/if}

    {#if bulk}
      <input type="hidden" name="documents" value={ids.join(",")} />
    {/if}

    <Flex>
      <Button type="submit" mode="danger" disabled={count === 0 || !$me}>
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
