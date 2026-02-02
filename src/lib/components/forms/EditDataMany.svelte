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
  import { fade } from "svelte/transition";
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
  let edited: Record<string, boolean> = $state({});

  // common, unique keys across documents
  let keys = $derived([...kv.keys(documents)]);

  let shared = $derived(kv.common(documents));

  let pairs = $derived(Object.entries(shared).filter(([k, v]) => k !== "_tag"));
  let tags = $derived(shared["_tag"] ?? []);

  let disabled = $derived(
    documents.length === 0 || documents.length > MAX_EDIT_BATCH,
  );

  let total_edited: number = $derived(
    Object.values(edited).filter(Boolean).length,
  );

  onMount(() => {
    csrf_token = getCsrfToken() ?? "";
  });

  async function add({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    const promises = documents.map(async (doc) => {
      const { data, error: err } = await kv.update(
        doc,
        key,
        [value],
        undefined,
        csrf_token,
      );

      if (data) {
        doc.data = data;
      }

      if (err) {
        error = err;
      }

      return doc;
    });

    documents = await Promise.all(promises);

    return { clear: !error, error: Boolean(error) };
  }

  async function edit({ key, value, previous }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    // handle unchanged, normalizing whitespace
    if (
      previous.key.trim() === key.trim() &&
      previous.value.trim() == value.trim()
    ) {
      return { key: key.trim(), value: value.trim() };
    }

    const promises = documents.map(async (doc) => {
      let updated: Maybe<Data>;

      // changing a key just creates a new entry, for now
      // and users can delete old keys if needed
      if (previous.key !== key) {
        const { data, error: err } = await kv.update(
          doc,
          key,
          [value],
          undefined,
          csrf_token,
        );
        updated = data;

        if (err) {
          error = err;
        }
      } else {
        // updating a value removes the previous value and inserts a new value
        const { data, error: err } = await kv.update(
          doc,
          key,
          [value],
          [previous.value],
          csrf_token,
        );
        updated = data;

        if (err) {
          error = err;
        }
      }

      if (updated) {
        doc.data = updated;
      }

      return doc;
    });

    documents = await Promise.all(promises);

    return { error: Boolean(error) };
  }

  async function remove({ key, value }): Promise<Result> {
    if (!key || !value) {
      console.warn(`Missing values: ${{ key, value }}`);
      return {};
    }

    const promises = documents.map(async (doc) => {
      const { data, error: err } = await kv.update(
        doc,
        key,
        undefined,
        [value],
        csrf_token,
      );

      if (err) {
        error = err;
      }

      if (data) {
        doc.data = data;
      }

      return doc;
    });

    documents = await Promise.all(promises);

    return { error: Boolean(error) };
  }

  function close() {
    onclose?.();
  }
</script>

<div class="card container">
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
    {#each pairs as [key, values], i}
      {#each values as value}
        <KeyValue
          {keys}
          {key}
          {value}
          {disabled}
          onedit={edit}
          ondelete={remove}
          bind:edited={edited[`${key}-${i}`]}
        />
      {/each}
    {/each}

    {#each tags as tag, i}
      <KeyValue
        {keys}
        key="_tag"
        value={tag}
        {disabled}
        onedit={edit}
        ondelete={remove}
        bind:edited={edited[`_tag-${i}`]}
      />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} add onadd={add} {disabled} bind:edited={edited["add"]} />
    </tfoot>
  </table>

  <input
    type="hidden"
    name="documents"
    value={documents.map((d) => d.id).join(",")}
  />

  <Flex class="buttons" align="center" gap={1}>
    <Button on:click={close}>{$_("dialog.done")}</Button>
    {#if total_edited > 0}
      <p class="unsaved" transition:fade>
        {$_("data.total_edited", { values: { n: total_edited } })}
      </p>
    {/if}
  </Flex>
</div>

<style>
  .container {
    padding: 1rem;
  }

  table,
  thead,
  tfoot {
    width: 100%;
  }

  th {
    text-align: start;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
  }

  th {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }

  .unsaved {
    color: var(--gray-5);
  }
</style>
