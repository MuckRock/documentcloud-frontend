<script lang="ts">
  import type { Document } from "$lib/api/types";

  import { invalidate } from "$app/navigation";

  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../common/Button.svelte";

  import KeyValue from "../inputs/KeyValue.svelte";

  export let document: Document;

  const dispatch = createEventDispatcher();

  $: keys = Object.keys(document.data).filter((k) => k !== "_tag");
  $: tags = document.data["_tag"];
  $: data = Object.entries(document.data).filter(([k, v]) => k !== "_tag");
  $: empty = Object.keys(document.data).length === 0;
</script>

<form class="card" method="post">
  <table>
    <thead>
      <tr>
        <th>
          {$_("data.key")}
        </th>
        <th>
          {$_("data.value")}
        </th>
        <td></td>
      </tr>
    </thead>

    <!-- kv -->
    {#each data as [key, values]}
      {#each values as value}
        <KeyValue {keys} {key} {value} />
      {/each}
    {/each}

    {#each tags as tag}
      <KeyValue key="_tag" value={tag} />
    {/each}
    <tfoot>
      <KeyValue />
    </tfoot>
  </table>
  <div class="buttons">
    <Button on:click={() => dispatch("close")}>{$_("dialog.done")}</Button>
  </div>
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
