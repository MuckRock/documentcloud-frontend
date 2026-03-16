<!--
  RangeAtom renders a range atom node.
  Shows field name, bounds, and bracket style (inclusive/exclusive).
-->
<script lang="ts">
  import { displayBound, rangeLabel } from "./utils/label";

  interface Props {
    field?: string;
    lower?: string;
    upper?: string;
    inclusiveLower?: boolean;
    inclusiveUpper?: boolean;
    prefix?: string | null;
  }

  let {
    field = "",
    lower = "*",
    upper = "*",
    inclusiveLower = true,
    inclusiveUpper = true,
    prefix = null,
  }: Props = $props();

  let lb = $derived(inclusiveLower ? "[" : "{");
  let rb = $derived(inclusiveUpper ? "]" : "}");

  let displayLower = $derived(displayBound(lower));
  let displayUpper = $derived(displayBound(upper));

  let atomLabel = $derived(
    rangeLabel({ field, lower, upper, inclusiveLower, inclusiveUpper, prefix }),
  );
</script>

<span
  class="search-atom search-range"
  class:atom-required={prefix === "+"}
  class:atom-excluded={prefix === "-"}
  aria-label={atomLabel}
>
  {#if prefix}
    <span
      class="atom-prefix"
      class:atom-prefix-required={prefix === "+"}
      class:atom-prefix-excluded={prefix === "-"}>{prefix}</span
    >
  {/if}
  <span class="atom-field">{field}</span>
  <span class="atom-bounds">{lb}{displayLower} to {displayUpper}{rb}</span>
</span>

<style>
  .search-range {
    background-color: var(--blue-1);
    border: 1px solid var(--blue-2);
    color: var(--blue-5);
  }

  .search-range.atom-required {
    background-color: var(--green-1);
    border-color: var(--green-2);
    color: var(--green-5);
  }

  .search-range.atom-excluded {
    background-color: var(--red-1);
    border-color: var(--red-2);
    color: var(--red-5);
  }

  .atom-field {
    opacity: 0.75;
    margin: 0 0.125rem 0 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-weight: 600;
    font-size: var(--font-xs, 12px);
  }

  .atom-prefix {
    font-weight: 600;
    margin-right: 1px;
  }

  .atom-prefix-required {
    color: inherit;
  }

  .atom-prefix-excluded {
    color: inherit;
  }

  .atom-bounds {
    font-size: 0.9em;
  }
</style>
