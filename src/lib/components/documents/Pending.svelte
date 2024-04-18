<script lang="ts">
  import type { Pending } from "$lib/api/types";
  import { _ } from "svelte-i18n";

  export let pending: Pending[];
</script>

{#if pending.length > 0}
  <div class="pending">
    <p>
      {$_("processingBar.processingDocuments", {
        values: { n: pending.length },
      })}
    </p>
  </div>
{/if}
