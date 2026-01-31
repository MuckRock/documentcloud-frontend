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

  import { onMount } from "svelte";
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
  import * as kv from "$lib/api/kv";
  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    documents: Document[];
    error?: Maybe<APIError<ValidationError>>;
    onclose?: () => void;
  }

  let { documents, error = $bindable(undefined), onclose }: Props = $props();

  const action = "/documents/?/data";

  let csrf_token: string = $state("");

  // common, unique keys across documents
  let keys = $derived([...kv.keys(documents)]);

  let shared = $derived(kv.common(documents));

  let pairs = $derived(Object.entries(shared).filter(([k, v]) => k !== "_tag"));
  let tags = $derived(shared["_tag"] ?? []);

  let disabled = $derived(
    documents.length === 0 || documents.length > MAX_EDIT_BATCH,
  );

  onMount(() => {
    csrf_token = getCsrfToken() ?? "";
  });

  async function add({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    const promises = documents.map(async (doc, i) => {
      const { data } = await kv.update(
        doc,
        key,
        [value],
        undefined,
        csrf_token,
      );

      if (data) {
        doc.data = data;
      }

      return doc;
    });

    documents = await Promise.all(promises);

    return { clear: true };
  }

  async function edit({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    documents.forEach(async (doc, i) => {
      const { data } = await kv.update(
        doc,
        key,
        [value],
        undefined,
        csrf_token,
      );

      if (data) {
        documents[i] = { ...doc, data };
      }
    });

    return {};
  }

  async function remove({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    return {};
  }

  function close() {
    onclose?.();
  }
</script>

<form {action} class="card" method="post">
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
    {#each pairs as [key, values]}
      {#each values as value}
        <KeyValue
          {keys}
          {key}
          {value}
          {disabled}
          onedit={edit}
          ondelete={remove}
        />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue
        {keys}
        key="_tag"
        value={tag}
        {disabled}
        onedit={edit}
        ondelete={remove}
      />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} add onadd={add} {disabled} />
    </tfoot>
  </table>

  <input
    type="hidden"
    name="documents"
    value={documents.map((d) => d.id).join(",")}
  />

  <Flex class="buttons">
    <Button on:click={close}>{$_("dialog.done")}</Button>
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
