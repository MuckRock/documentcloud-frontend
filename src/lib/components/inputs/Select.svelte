<!-- @component
Wrapper for Svelecte v4: https://github.com/mskocik/svelecte

Upgrade to v5 when migrating to Svelte 5
-->
<script lang="ts">
  import Svelecte from "svelecte";
  import { ChevronDown16, X16 } from "svelte-octicons";

  // Public API (keep same for backward compatibility)
  export let name: string;
  export let required: boolean = false;
  export let items: any[]; // todo: rename to options
  export let itemId: string = "value"; // Will map to 'valueField'
  export let label: string = "label"; // Will map to 'labelField'
  export let value: any = null;
  export let multiple: boolean = false;
  export let clearable: boolean = false;
  export let placeholder: string = multiple ? "Select..." : "Select";

  // Computed justValue (read-only, derived from value)
  export let justValue: any = undefined;
  $: {
    if (multiple && Array.isArray(value)) {
      justValue = value.map((v) => (typeof v === "object" ? v[itemId] : v));
    } else if (value !== null && typeof value === "object") {
      justValue = value[itemId];
    } else {
      justValue = value;
    }
  }

  // Optional: Add searchable prop (Svelecte default is true)
  export let searchable = true;
</script>

<Svelecte
  class="select elevated sourceCodePro gray-4 svelecte-control"
  {name}
  {required}
  options={items}
  valueField={itemId}
  labelField={label}
  bind:value
  {multiple}
  {clearable}
  {placeholder}
  {searchable}
>
  <ChevronDown16 slot="indicator-icon" />
  <X16 slot="clear-icon" />
</Svelecte>
