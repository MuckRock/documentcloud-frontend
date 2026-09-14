<!-- @component
Show an error returned by the API, with whatever detail it sent along.
-->
<script lang="ts">
  import type { APIError } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Alert24 } from "svelte-octicons";

  import Tip from "./Tip.svelte";

  import { normalizeErrors } from "$lib/utils/api";

  interface Props {
    error: APIError<unknown>;
  }

  let { error }: Props = $props();

  let groups = $derived(normalizeErrors(error.errors));
</script>

<Tip mode="error">
  {#snippet icon()}<Alert24 />{/snippet}
  <div role="alert">
    <p>{error.message || $_("common.error")}</p>
    {#if groups.length}
      <ul>
        {#each groups as { field, messages }}
          <li>
            {#if field}<strong>{field}</strong>:{/if}
            {messages.join("; ")}
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</Tip>
