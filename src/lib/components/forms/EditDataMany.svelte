<!-- @component
Edit data for many documents at once.
This will mostly merge with existing data.
-->
<script lang="ts">
  import type { ActionResult } from "@sveltejs/kit";
  import type { Document, Data } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue from "$lib/components/inputs/KeyValue.svelte";

  export let documents: Document[];

  const dispatch = createEventDispatcher();
  const action = "/documents/?/data";

  let kv: KeyValue;
  let data: Data = {};

  $: keys = documents.map((d) => Object.keys(d.data)).flat();
  $: tags = documents.map((d) => d.data["_tag"] ?? []).flat();

  function add({ key, value }) {
    if (!key || !value) return;

    if (key in data) {
      data[key] = [...data[key], value];
    } else {
      data[key] = [value];
    }

    kv.clear();
  }

  function remove({ key, value }) {
    if (!(key in data)) return;

    data[key] = data[key].filter((v) => v !== value);
  }

  function onSubmit() {
    return async ({
      result,
      update,
    }: {
      result: ActionResult;
      update: (options?: Record<string, any>) => void;
    }) => {
      // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      dispatch("close");
      update(result);
    };
  }
</script>

<form {action} class="card" method="post" use:enhance={onSubmit}>
  <p>{$_("data.many", { values: { n: documents.length } })}</p>
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
        <KeyValue {keys} {key} {value} on:delete={(e) => remove(e.detail)} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue
        {keys}
        key="_tag"
        value={tag}
        on:delete={(e) => remove(e.detail)}
      />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} bind:this={kv} add on:add={(e) => add(e.detail)} />
    </tfoot>
  </table>

  <input
    type="hidden"
    name="documents"
    value={documents.map((d) => d.id).join(",")}
  />

  <Flex class="buttons">
    <Button type="submit" mode="primary">{$_("data.save")}</Button>
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
