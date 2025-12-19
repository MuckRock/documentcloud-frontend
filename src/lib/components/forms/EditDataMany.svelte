<!-- @component
Edit data for many documents at once.
This will mostly merge with existing data.
-->
<script lang="ts">
  import type {
    APIError,
    Document,
    Data,
    Maybe,
    ValidationError,
  } from "$lib/api/types";

  import { enhance } from "$app/forms";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue from "$lib/components/inputs/KeyValue.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";

  export let documents: Document[];
  export let error: Maybe<APIError<ValidationError>> = undefined;

  const dispatch = createEventDispatcher();
  const action = "/documents/?/data";

  let kv: KeyValue;
  let data: Data = {};

  $: keys = documents.map((d) => Object.keys(d.data)).flat();
  $: tags = documents.map((d) => d.data["_tag"] ?? []).flat();
  $: disabled = documents.length > MAX_EDIT_BATCH;

  function add({ key, value }) {
    if (!key || !value) return;

    if (key in data) {
      data[key] = [...(data[key] ?? []), value];
    } else {
      data[key] = [value];
    }

    kv.clear();
  }

  function remove({ key, value }) {
    if (!(key in data)) return;

    data[key] = (data[key] ?? []).filter((v) => v !== value);
  }

  /**
   * @type {import('@sveltejs/kit').SubmitFunction}
   */
  function onSubmit({ submitter }) {
    submitter.disabled = true;

    return async ({ result, update }) => {
      submitter.disabled = false;
      if (result.type === "failure") {
        console.error(result);
        error = result.data.error;
      }

      if (result.type === "success") {
        update(result);
        dispatch("close");
      }
    };
  }
</script>

<form {action} class="card" method="post" use:enhance={onSubmit}>
  <ShowSize size={documents.length}>
    <p>{$_("data.many", { values: { n: documents.length } })}</p>
    <Tip mode="error" slot="empty">
      <Alert24 slot="icon" />
      {$_("edit.nodocs")}
    </Tip>
    <Tip mode="danger" slot="oversize">
      <Alert24 slot="icon" />
      {$_("edit.toomany", { values: { n: MAX_EDIT_BATCH } })}
    </Tip>
  </ShowSize>

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

  <table>
    <thead>
      <tr>
        <th>
          {$_("data.key")}
        </th>
        <th>
          {$_("data.value")}
        </th>
      </tr>
    </thead>

    <!-- kv -->
    {#each Object.entries(data) as [key, values]}
      {#each values as value}
        <KeyValue {keys} {key} {value} ondelete={(e) => remove(e)} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue
        {keys}
        key="_tag"
        value={tag}
        {disabled}
        ondelete={(e) => remove(e)}
      />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} bind:this={kv} add onadd={(e) => add(e)} {disabled} />
    </tfoot>
  </table>

  <input
    type="hidden"
    name="documents"
    value={documents.map((d) => d.id).join(",")}
  />

  <Flex class="buttons">
    <Button type="submit" mode="primary" {disabled}>{$_("data.save")}</Button>
    <Button on:click={() => dispatch("close")}>{$_("data.cancel")}</Button>
  </Flex>
</form>

<style>
  table,
  thead,
  tfoot {
    width: 100%;
  }

  form {
    padding: 1rem;
  }

  th {
    text-align: start;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
  }

  th {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
</style>
