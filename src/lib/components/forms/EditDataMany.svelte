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

  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue, {
    type Result,
  } from "$lib/components/inputs/KeyValue.svelte";
  import ShowSize from "../common/ShowSize.svelte";
  import Tip from "../common/Tip.svelte";

  import { MAX_EDIT_BATCH } from "@/config/config.js";

  interface Props {
    documents: Document[];
    error?: Maybe<APIError<ValidationError>>;
    onclose: () => void;
  }

  let { documents, error = $bindable(undefined), onclose }: Props = $props();

  const action = "/documents/?/data";

  let kv: Maybe<KeyValue> = $state();

  let data: Data = $state({});

  let keys = $derived(documents.map((d) => Object.keys(d.data)).flat());
  let tags = $derived(documents.map((d) => d.data["_tag"] ?? []).flat());
  let disabled = $derived(documents.length > MAX_EDIT_BATCH);

  $inspect(keys, data);

  async function add({ key, value }): Promise<Result> {
    if (!key || !value) return {};

    if (key in data) {
      data[key] = [...(data[key] ?? []), value];
    } else {
      data[key] = [value];
    }

    return { clear: true };
  }

  async function remove({ key, value }): Promise<Result> {
    console.log({ key, value });
    if (key in data) {
      data[key] = (data[key] ?? []).filter((v) => v !== value);
    } else if (keys.includes(key)) {
      console.log(`Removing key: ${key}`);
      keys = keys.filter((k) => k !== key);
    } else {
      console.warn(`Unknown key: ${key}`);
    }

    return {};
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
        onclose();
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
        <KeyValue {keys} {key} {value} ondelete={remove} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue {keys} key="_tag" value={tag} {disabled} ondelete={remove} />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} bind:this={kv} add onadd={add} {disabled} />
    </tfoot>
  </table>

  <input
    type="hidden"
    name="documents"
    value={documents.map((d) => d.id).join(",")}
  />

  <Flex class="buttons">
    <Button type="submit" mode="primary" {disabled}>{$_("data.save")}</Button>
    <Button on:click={() => onclose()}>{$_("data.cancel")}</Button>
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
