<!--
  FieldValueChip: Renders a field-value atom node as an interactive chip.
  Shows field label, value (or displayValue), prefix indicator, boost badge,
  and a loading indicator for entity fields awaiting API enrichment.
-->
<script lang="ts">
  /** Entity fields that may need async display name resolution */
  const ENTITY_FIELDS = new Set([
    "user",
    "organization",
    "project",
    "document",
  ]);

  export let field: string = "";
  export let value: string = "";
  export let displayValue: string | null = null;
  export let prefix: string | null = null;
  export let boost: number | null = null;
  export let quoted: boolean = false;

  /** Format a value for display. ISO dates become locale strings. */
  function displayBound(v: string): string {
    if (v.includes("-")) {
      const date = new Date(v);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return v;
  }

  $: isEntity = ENTITY_FIELDS.has(field);
  $: showLoading = isEntity && !displayValue;
  $: label = displayValue ?? displayBound(value);
</script>

<span class="search-chip search-field-value">
  {#if prefix}
    <span
      class="chip-prefix"
      class:chip-prefix-required={prefix === "+"}
      class:chip-prefix-excluded={prefix === "-"}>{prefix}</span
    >
  {/if}
  <span class="chip-field">{field}:</span>
  <span class="chip-value">{label}</span>
  {#if showLoading}
    <span class="chip-loading" aria-label="Loading display name"
      >&hellip;</span
    >
  {/if}
  {#if boost}
    <span class="chip-boost">^{boost}</span>
  {/if}
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

  .chip-loading {
    opacity: 0.5;
    margin-left: 2px;
  }

  .chip-boost {
    font-size: 0.8em;
    opacity: 0.6;
    margin-left: 2px;
  }
</style>
