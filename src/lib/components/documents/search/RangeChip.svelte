<!--
  RangeChip: Renders a range atom node as a chip.
  Shows field name, bounds, and bracket style (inclusive/exclusive).
-->
<script lang="ts">
  export let field: string = "";
  export let lower: string = "*";
  export let upper: string = "*";
  export let inclusiveLower: boolean = true;
  export let inclusiveUpper: boolean = true;
  export let prefix: string | null = null;

  $: lb = inclusiveLower ? "[" : "{";
  $: rb = inclusiveUpper ? "]" : "}";

  /** Format a bound value for display. ISO dates become locale strings. */
  function displayBound(value: string): string {
    // Only attempt date parsing for values that look like actual dates
    // (contain a hyphen, e.g. "2024-01-15" or "2024-01-15T00:00:00Z").
    // Bare numbers like "1" or "50" should not be treated as dates.
    if (value.includes("-")) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return value;
  }

  $: displayLower = displayBound(lower);
  $: displayUpper = displayBound(upper);
</script>

<span class="search-chip search-range">
  {#if prefix}
    <span
      class="chip-prefix"
      class:chip-prefix-required={prefix === "+"}
      class:chip-prefix-excluded={prefix === "-"}>{prefix}</span
    >
  {/if}
  <span class="chip-field">{field}:</span>
  <span class="chip-bounds">{lb}{displayLower} TO {displayUpper}{rb}</span>
</span>

<style>
  .chip-field {
    opacity: 0.7;
    margin-right: 2px;
  }

  .chip-prefix {
    font-weight: 700;
    margin-right: 1px;
  }

  .chip-prefix-required {
    color: var(--green-3, #2da44e);
  }

  .chip-prefix-excluded {
    color: var(--orange-3, #d1242f);
  }

  .chip-bounds {
    font-family: var(--font-mono, monospace);
    font-size: 0.9em;
  }
</style>
