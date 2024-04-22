<script lang="ts">
  import type { Pending } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Sync24 } from "svelte-octicons";

  export let pending: Pending[];
</script>

{#if pending.length > 0}
  <div class="pending">
    <Sync24 />
    <div>
      <h4>{$_("processingBar.processing")}</h4>
      <p>
        {$_("processingBar.processingDocuments", {
          values: { n: pending.length },
        })}
      </p>
    </div>
  </div>
{/if}

<style>
  .pending {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: start;

    border: 1px solid var(--blue-3, #b5ceed);
    border-radius: 0.5rem;
    background: var(--blue-1, #eef3f9);
    padding: 0.5rem 0.75rem;

    box-shadow: var(--shadow);
  }
</style>
