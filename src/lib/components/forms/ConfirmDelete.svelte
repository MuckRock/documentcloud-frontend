<!-- @component
Confirm deletion or one or more documents.
-->
<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Check16, Undo16 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let documents: Document[];

  const dispatch = createEventDispatcher();

  let error: string = undefined;

  $: bulk = documents.length !== 1; // if it's zero, handle that elsewhere
  $: action = bulk
    ? "/app/?/delete"
    : canonicalUrl(documents[0]).href + "?/delete"; // TODO: update to /documents/ when we move things
</script>

<form {action} method="post" use:enhance>
  <Flex direction="column">
    <h2>{$_("delete.title")}</h2>
    <p>{$_("delete.really", { values: { n: documents.length } })}</p>

    {#if error}
      <p class="error">
        <span>{$_("delete.error")}:</span>
        {error}
      </p>
    {/if}

    <Flex>
      <Button type="submit" mode="danger">
        <Check16 />
        {$_("delete.confirm")}
      </Button>
      <Button on:click={() => dispatch("close")}>
        <Undo16 />
        {$_("delete.cancel")}
      </Button>
    </Flex>
  </Flex>
</form>
