<script lang="ts">
  import type { Maybe } from "$lib/api/types";
  import type { Level } from "$lib/utils/access";

  import { _ } from "svelte-i18n";

  interface Props {
    level?: Maybe<Level>;
  }

  let { level }: Props = $props();
</script>

{#if level}
  <div class="access {level.value}">
    <level.icon height="1em" width="1em" />
    {$_(level.title)}
  </div>
{/if}

<style>
  .access {
    display: flex;
    align-items: center;
    gap: 0.5em;

    font-weight: var(--font-semibold);
    color: var(--color, var(--gray-5));
    fill: var(--fill, var(--gray-4));
  }

  .access.public {
    fill: var(--note-public);
    color: color-mix(in srgb, var(--note-public), var(--gray-5));
  }

  .access.organization {
    fill: var(--note-org);
    color: color-mix(in srgb, var(--note-org), var(--gray-5));
  }

  .access.private {
    fill: var(--note-private);
    color: color-mix(in srgb, var(--note-private), var(--gray-5));
  }
</style>
