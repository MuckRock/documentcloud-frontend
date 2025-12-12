<!-- @component
Wrapper for Svelecte v4: https://github.com/mskocik/svelecte

Upgrade to v5 when migrating to Svelte 5
-->
<script lang="ts">
  import Svelecte from "svelecte";
  import { X16 } from "svelte-octicons";

  export let name: string;
  export let required: boolean = false;
  export let options: any[];
  export let valueField: string = "value"; // Will map to 'valueField'
  export let labelField: string = "label"; // Will map to 'labelField'
  export let value: any = null;
  export let multiple: boolean = false;
  export let clearable: boolean = false;
  export let placeholder: string = multiple ? "Select..." : "Select";
  export let searchable = true;
  export let valueAsObject = false;
  export let disabled = false;
</script>

<Svelecte
  class="svelecte select"
  {name}
  {required}
  {options}
  {valueField}
  {labelField}
  {multiple}
  {clearable}
  {placeholder}
  {searchable}
  {valueAsObject}
  {disabled}
  bind:value
  --sv-bg="var(--white, #fff)"
  --sv-border="1px solid var(--gray-2, #99a8b3)"
  --sv-active-border="1px solid var(--blue-2, #4294f0)"
  --sv-min-height="2.65rem"
  --sv-item-btn-bg-hover="var(--blue-1, #eef3f9)"
  --sv-item-selected-bg="var(--blue-1, #4294f0)"
  --sv-item-selected-color="var(--white, #fff)"
  --sv-dropdown-shadow="var(--shadow-1)"
  --sv-dropdown-border="1px solid var(--gray-2, #d8dee2)"
  --sv-multi-item-bg="var(--blue-1, #eef3f9)"
  --sv-multi-item-color="var(--blue-5, #053775)"
  --sv-multi-clear-icon-color="var(--blue-5, #053775)"
  --sv-multi-item-outline="var(--blue-2, #b5ceed)"
  --sv-multi-item-input-margin="0"
  --sv-multi-item-padding="0 0 0 0.75rem"
>
  <X16 slot="clear-icon" />
</Svelecte>
