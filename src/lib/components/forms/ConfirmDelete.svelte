<!-- @component
Confirm deletion or one or more documents.
-->
<script lang="ts">
  import type { SubmitFunction } from "@sveltejs/kit";
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Trash16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl, deleted } from "$lib/api/documents";

  // one document or a list of IDs
  export let document: Document = undefined;
  export let ids: (string | number)[] = [];

  const dispatch = createEventDispatcher();

  let error: string = undefined;

  $: bulk = document === undefined; // if it's zero, handle that elsewhere
  $: count = document ? 1 : ids.length;
  $: action = bulk
    ? "/documents/?/delete"
    : canonicalUrl(document).href + "?/delete"; // TODO: update to /documents/ when we move things

  function onSubmit({ submitter }) {
    submitter.disabled = true;
    return ({ result, update }) => {
      if (result.type === "success") {
        dispatch("close");
        ids.forEach((d) => $deleted.add(String(d)));
        if (document !== undefined) {
          $deleted.add(document.id.toString());
        }
      }
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
      <Button type="submit" mode="danger" disabled={count === 0}>
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
