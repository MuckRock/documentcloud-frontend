<!--
  FieldValueAtom renders a field-value atom node.
  Shows field label, value (or displayValue), prefix indicator, boost badge,
  and a loading indicator for entity fields awaiting API enrichment.
-->
<script lang="ts">
  import { displayBound, fieldValueLabel } from "./utils/label";

  /** Entity fields that may need async enrichment */
  const RICH_FIELDS = new Set(["user", "organization", "project", "document"]);

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
    locked = false,
  }: Props = $props();

  let isRich = $derived(RICH_FIELDS.has(field));
  let showLoading = $derived(isRich && !displayValue);
  let label = $derived(displayValue ?? displayBound(value));

  let atomLabel = $derived(
    fieldValueLabel({ field, value, displayValue, prefix, boost }),
  );
</script>

<span
  class="search-atom search-field-value"
  class:locked
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
  <span class="atom-value">{label}</span>
  {#if showLoading}
    <span class="atom-loading" aria-label="Loading display name">&hellip;</span>
  {/if}
  {#if boost && boost > 1}
    <span class="atom-boost">^{boost}</span>
  {/if}
</span>

<style>
  .search-field-value {
    background-color: var(--blue-1);
    border: 1px solid var(--blue-2);
    color: var(--blue-5);
  }

  .search-field-value.atom-required {
    background-color: var(--green-1);
    border-color: var(--green-2);
    color: var(--green-5);
  }

  .search-field-value.atom-excluded {
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

  .atom-loading {
    opacity: 0.5;
    margin-left: 2px;
  }

  .atom-boost {
    font-size: 0.8em;
    opacity: 0.6;
    margin-left: 2px;
  }
</style>
