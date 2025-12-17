<script lang="ts">
  import type { ActionResult } from "@sveltejs/kit";
  import type { Document } from "$lib/api/types";

  import { enhance } from "$app/forms";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "$lib/components/common/Button.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import KeyValue from "$lib/components/inputs/KeyValue.svelte";

  import { canonicalUrl } from "$lib/api/documents";
  import { toast } from "../layouts/Toaster.svelte";

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
      document.data[key] = [...(document.data[key] ?? []), value];
    } else {
      document.data[key] = [value];
    }

    kv.clear();
  }

  function remove({ key, value }) {
    if (!(key in document.data)) return;

    document.data[key] = (document.data[key] ?? []).filter((v) => v !== value);
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
      if (result.type === "success") {
        // do something
        toast($_("edit.success"), { status: "success" });
      }
    };
  }
</script>

<form {action} method="post" use:enhance={onSubmit}>
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
        <KeyValue {keys} {key} {value} ondelete={(e) => remove(e)} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue {keys} key="_tag" value={tag} ondelete={(e) => remove(e)} />
    {/each}
    <tfoot>
      <tr>
        <th>
          {$_("data.addNew")}
        </th>
      </tr>
      <KeyValue {keys} bind:this={kv} add onadd={(e) => add(e)} />
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
  }

  form {
    width: 100%;
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
