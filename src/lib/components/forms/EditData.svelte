<script lang="ts">
  import type {
    APIError,
    Data,
    Document,
    Maybe,
    ValidationError,
  } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue, {
    type Result,
  } from "$lib/components/inputs/KeyValue.svelte";
  import Tip from "$lib/components/common/Tip.svelte";

  import * as kv from "$lib/api/kv";
  import { getCsrfToken } from "$lib/utils/api";

  interface Props {
    document: Document;
    onclose?: (() => void) | undefined;
  }

  let { document = $bindable(), onclose = undefined }: Props = $props();

  let csrf_token: string = $state("");
  let error: Maybe<APIError<ValidationError>> = $state();
  let edited: Record<string, boolean> = $state({});

  let keys = $derived(Object.keys(document.data) ?? []);
  let tags = $derived(document.data["_tag"] ?? []);
  let data = $derived(
    Object.entries(document?.data)?.filter(([k, v]) => k !== "_tag") ?? [],
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

    const { data, error: err } = await kv.update(
      document,
      key,
      [value],
      undefined,
      csrf_token,
    );

    if (data) {
      document = { ...document, data };
      await invalidate(`document:${document.id}`);
    }

    error = err;

    return {
      clear: !err,
      error: Boolean(err),
    };
  }

  async function onedit({ key, value, previous }): Promise<Result> {
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

    let updated: Maybe<Data>;

    // changing a key just creates a new entry, for now
    // and users can delete old keys if needed
    if (previous.key !== key) {
      const { data, error: err } = await kv.update(
        document,
        key,
        [value],
        undefined,
        csrf_token,
      );
      updated = data;
      error = err;
    } else {
      // updating a value removes the previous value and inserts a new value
      const { data, error: err } = await kv.update(
        document,
        key,
        [value],
        [previous.value],
        csrf_token,
      );

      updated = data;
      error = err;
    }

    if (updated) {
      document = { ...document, data: updated };
      await invalidate(`document:${document.id}`);
    }

    return { key, value, error: Boolean(error) };
  }

  async function remove({ key, value }): Promise<Result> {
    if (!(key in document.data)) {
      console.warn(`Unknown key: ${key}`);
      return {};
    }

    const { data, error: err } = await kv.update(
      document,
      key,
      [],
      [value],
      csrf_token,
    );

    if (data) {
      document = { ...document, data };
      await invalidate(`document:${document.id}`);
    }

    error = err;

    return { error: Boolean(err) };
  }

  function close() {
    onclose?.();
  }
</script>

<div class="container">
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
    {#each data as [key, values], i}
      {#each values as value}
        <KeyValue
          {keys}
          {key}
          {value}
          ondelete={remove}
          {onedit}
          bind:edited={edited[`${key}-${i}`]}
        />
      {/each}
    {/each}

    {#each tags as tag, i}
      <KeyValue
        {keys}
        key="_tag"
        value={tag}
        ondelete={remove}
        {onedit}
        bind:edited={edited[`_tag-${i}`]}
      />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} add onadd={add} bind:edited={edited["add"]} />
    </tfoot>
  </table>
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
    width: 100%;
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
