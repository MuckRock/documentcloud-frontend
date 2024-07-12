<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { invalidate } from "$app/navigation";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import KeyValue from "../inputs/KeyValue.svelte";

  import { canonicalUrl } from "$lib/api/documents";

  export let document: Document;

  const dispatch = createEventDispatcher();

  let kv: KeyValue;

  $: keys = Object.keys(document.data) ?? [];
  $: tags = document.data["_tag"] ?? [];
  $: data =
    Object.entries(document?.data)?.filter(([k, v]) => k !== "_tag") ?? [];
  $: action = new URL("?/data", canonicalUrl(document)).href;

  function add({ key, value }) {
    if (!key || !value) return;

    if (key in document.data) {
      document.data[key] = [...document.data[key], value];
    } else {
      document.data[key] = [value];
    }

    kv.clear();
  }

  function remove({ key, value }) {
    if (!(key in document.data)) return;

    document.data[key] = document.data[key].filter((v) => v !== value);
  }

  function onSubmit() {
    return async ({ result, update }) => {
      // `result` is an `ActionResult` object
      // `update` is a function which triggers the default logic that would be triggered if this callback wasn't set
      dispatch("close");
      update(result);
    };
  }
</script>

<form {action} class="card" method="post" use:enhance={onSubmit}>
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
    {#each data as [key, values]}
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
      <KeyValue
        {keys}
        bind:this={kv}
        add
        on:add={(e) => add(e.detail)}
        on:delete={(e) => remove(e.detail)}
      />
    </tfoot>
  </table>
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
    background: var(--gray-1, #f5f6f7);
  }

  form {
    background: var(--gray-1, #f5f6f7);
    padding: 1rem;
  }

  th {
    text-align: start;
    font-size: var(--font-m);
  }

  th {
    padding: 0 0.5rem 0.5rem 0;
  }
</style>
