<svelte:options accessors />

<!-- @component
  `svelte-select` provides a flexible, customizable basis for the InputSelect component.

  - https://github.com/rob-balfre/svelte-select
  - https://svelte-select-examples.vercel.app/
  
  For data-specific select inputs, like a selection with user avatars,
  create a custom Select implementation and give it the `select` class.
-->

<script context="module" lang="ts">
  /**
   * Select wraps values in an object, which turns into a JSON string in HTML.
   * This function will unwrap it.
   */
  export function unwrap(value: string, fallback: any = null): any {
    try {
      return JSON.parse(value).value;
    } catch {
      return fallback;
    }
  }
</script>

<script lang="ts" generics="T">
  import Select from "svelte-select";
  import { ChevronDown16, X12, X16 } from "svelte-octicons";
  import type { Maybe } from "@/lib/api/types";

  export let name: string;
  export let required = false;
  export let items: Maybe<T[]> = undefined;
  export let loadOptions: Maybe<(text: string) => Promise<T[]>> = undefined;
  export let itemId: string = "value";
  export let label: string = "label";
  export let value: any = null;
  export let justValue: any = null; // read-only; don't set this
  export let multiple = false;
  export let clearable = false;
  export let placeholder: string = multiple ? "Select multiple" : "Select one";
  export let floatingConfig = {};
</script>

<Select
  {name}
  {required}
  {items}
  {loadOptions}
  {multiple}
  {clearable}
  {placeholder}
  {itemId}
  {label}
  {floatingConfig}
  bind:value
  bind:justValue
  showChevron
  --background="var(--white, #fff)"
  --border="1px solid var(--gray-2, #99a8b3)"
  --border-radius="0.5rem"
  --border-focused="1px solid var(--blue-3)"
  --padding="0 0 0 0.5rem"
  --item-hover-bg="var(--blue-1, #eef3f9)"
  --item-is-active-bg="var(--blue-3, #4294f0)"
  --list-shadow="var(--shadow-2)"
  --list-border="1px solid var(--gray-2, #d8dee2)"
  --multi-item-bg="var(--blue-1, #eef3f9)"
  --multi-item-color="var(--blue-5, #053775)"
  --multi-item-clear-icon-color="var(--blue-5, #053775)"
  --multi-item-outline="var(--blue-2, #b5ceed)"
  --multi-select-input-margin="0"
  --multi-select-padding="0 0 0 0.5rem"
  class="select elevated sourceCodePro gray-4"
>
  <slot name="prepend" slot="prepend" />
  <ChevronDown16 slot="chevron-icon" />
  <X16 slot="clear-icon" />
  <X12 slot="multi-clear-icon" fill="var(--multi-item-clear-icon-color)" />
  <slot slot="item" name="item" let:item>
    <p>{item[label]}</p>
  </slot>
</Select>

<style>
  :global(.select) {
    display: flex;
    gap: 0.5rem;
    color: var(--gray-5);
    fill: var(--gray-4);
    font-size: var(--font-sm);
    box-shadow: 0px 2px 1px 0px var(--gray-1, #d8dee2) inset;
  }
  :global(.select .indicators) {
    fill: var(--gray-5, #233944);
  }
  :global(.select.focused .indicators) {
    fill: var(--blue-5, #053775);
  }
  :global(.select input, .select .selected-item) {
    font-family: "Source Sans Pro";
    font-style: normal;
    line-height: normal;
    box-shadow: none;
  }
  :global(.select.focused input, .select.focused .selected-item) {
    color: var(--blue-5, #053775) !important;
  }
</style>
