<script lang="ts">
  import type { Pending } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Sync24 } from "svelte-octicons";
  import Tip from "../common/Tip.svelte";

  interface Props {
    pending: Pending[];
  }

  let { pending }: Props = $props();
</script>

{#if pending.length > 0}
  <Tip
    --background-color="var(--blue-1)"
    --border-color="var(--blue-3)"
    --border-radius="0.5rem"
    --gap="0.75rem"
    --padding="0.5rem 0.75rem"
  >
    <Sync24 slot="icon" />
    <h4>{$_("processingBar.processing")}</h4>
    <p>
      {$_("processingBar.processingDocuments", {
        values: { n: pending.length },
      })}
    </p>
  </Tip>
{/if}
