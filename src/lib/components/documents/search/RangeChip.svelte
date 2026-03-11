<!--
  RangeChip renders a range atom.
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

  /** Format a bound value for display. ISO dates become locale strings.
   * 
   *  Only attempt date parsing for values that look like actual dates
   *  (contain a hyphen, e.g. "2024-01-15" or "2024-01-15T00:00:00Z").
   *  Bare numbers like "1" or "50" should not be treated as dates.
  */
  function displayBound(value: string): string {
    
    if (/\d-\d/.test(value)) {
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
  <span class="chip-field">{field}</span>
  <span class="chip-bounds">{lb}{displayLower} to {displayUpper}{rb}</span>
</span>

<style>
  .search-range {
    background-color: var(--blue-1);
    border: 1px solid var(--blue-2);
    color: var(--blue-5);
  }

  .chip-field {
    opacity: 0.7;
    margin: 0 0.125rem 0 0;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    font-weight: 600;
    font-size: var(--font-xs, 12px);
  }

  .chip-prefix {
    font-weight: 600;
    margin-right: 1px;
  }

  .chip-prefix-required {
    color: var(--green-3);
  }

  .chip-prefix-excluded {
    color: var(--orange-3);
  }

  .chip-bounds {
    font-size: 0.9em;
  }
</style>
