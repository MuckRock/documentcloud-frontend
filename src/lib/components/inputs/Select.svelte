<!-- @component
Wrapper for Svelecte: https://github.com/mskocik/svelecte
-->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Svelecte from "svelecte";
  import { X16 } from "svelte-octicons";

  interface Props extends Omit<ComponentProps<typeof Svelecte>, "value"> {
    name: string;
    required?: boolean;
    options: any[];
    valueField?: string;
    labelField?: string;
    value?: any;
    multiple?: boolean;
    clearable?: boolean;
    placeholder?: string;
    searchable?: boolean;
    valueAsObject?: boolean;
    disabled?: boolean;
  }

  let {
    name,
    value = $bindable(null),
    required = false,
    options = [],
    valueField = "value",
    labelField = "label",
    multiple = false,
    clearable = false,
    placeholder = multiple ? "Select..." : "Select",
    searchable = true,
    valueAsObject = false,
    disabled = false,
    ...rest
  }: Props = $props();
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
  {...rest}
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
  {#snippet clearIcon()}
    <X16 />
  {/snippet}
</Svelecte>
