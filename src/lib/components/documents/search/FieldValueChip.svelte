<!--
  FieldValueChip renders a field-value atom node as an interactive chip.
  Shows field label, value (or displayValue), prefix indicator, boost badge,
  and a loading indicator for entity fields awaiting API enrichment.
-->
<script lang="ts">
  /** Entity fields that may need async enrichment */
  const RICH_FIELDS = new Set([
    "user",
    "organization",
    "project",
    "document",
  ]);

  interface Props {
    field?: string;
    value?: string;
    displayValue?: string | null;
    prefix?: string | null;
    boost?: number | null;
    quoted?: boolean;
    locked?: boolean;
  }

  let {
    field = "",
    value = "",
    displayValue = null,
    prefix = null,
    boost = null,
    quoted = false,
    locked = false
  }: Props = $props();

  /** Format a value for display. ISO dates become locale strings. */
  function displayBound(v: string): string {
    if (/^\d{4}-\d{2}-\d{2}/.test(v)) {
      const date = new Date(v);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return v;
  }

  let isRich = $derived(RICH_FIELDS.has(field));
  let showLoading = $derived(isRich && !displayValue);
  let label = $derived(displayValue ?? displayBound(value));

  let chipLabel = $derived(() => {
    const prefixText = prefix === "+" ? "required, " : prefix === "-" ? "excluded, " : "";
    const boostText = boost && boost > 1 ? `, boost ${boost}` : "";
    return `${prefixText}${field}: ${label}${boostText}`;
  });
</script>

<span class="search-chip search-field-value" class:locked class:chip-required={prefix === "+"} class:chip-excluded={prefix === "-"} aria-label={chipLabel()}>
  {#if prefix}
    <span
      class="chip-prefix"
      class:chip-prefix-required={prefix === "+"}
      class:chip-prefix-excluded={prefix === "-"}>{prefix}</span
    >
  {/if}
  <span class="chip-field">{field}</span>
  <span class="chip-value">{label}</span>
  {#if showLoading}
    <span class="chip-loading" aria-label="Loading display name"
      >&hellip;</span
    >
  {/if}
  {#if boost && boost > 1}
    <span class="chip-boost">^{boost}</span>
  {/if}
</span>

<style>
  .search-field-value {
    background-color: var(--blue-1);
    border: 1px solid var(--blue-2);
    color: var(--blue-5);
  }

  .search-field-value.chip-required {
    background-color: var(--green-1);
    border-color: var(--green-2);
    color: var(--green-5);
  }

  .search-field-value.chip-excluded {
    background-color: var(--red-1);
    border-color: var(--red-2);
    color: var(--red-5);
  }
  
  .search-field-value.locked {
    flex: 0 0 auto;
    opacity: 0.7;
    cursor: default;
    user-select: none;
  }

  .chip-field {
    opacity: 0.75;
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
    color: inherit;
  }

  .chip-prefix-excluded {
    color: inherit;
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
