<!-- InputSelect.svelte
  
  `svelte-select` provides a flexible, customizable basis for the InputSelect component.

  - https://github.com/rob-balfre/svelte-select
  - https://svelte-select-examples.vercel.app/
  
  For data-specific select inputs, like a selection with user avatars,
  create a custom Select implementation and give it the `select` class.
-->

<script lang="ts">
  import Select from "svelte-select";
  import { ChevronDown16, X16 } from "svelte-octicons";

  export let name: string;
  export let required = false;
  export let items: any[];
  export let value: any = null;
  export let multiple = false;
  export let clearable = false;
  export let placeholder: string = multiple ? "Select multiple" : "Select one";
</script>

<Select
  {name}
  {required}
  {items}
  {multiple}
  {clearable}
  {placeholder}
  bind:value
  showChevron
  --height="2.125rem"
  --background="var(--White, #fff)"
  --border="1px solid var(--gray-3, #99a8b3)"
  --border-radius="0.5rem"
  --border-focused="1px solid var(--blue-3, #4294f0)"
  --padding="0 0 0 0.75rem"
  --item-hover-bg="var(--blue-1, #eef3f9)"
  --item-is-active-bg="var(--blue-3, #4294f0)"
  --list-shadow="var(--shadow)"
  --list-border="1px solid var(--gray-2, #d8dee2)"
  --value-container-padding="0"
  class="select elevated sourceCodePro gray-4"
>
  <ChevronDown16 slot="chevron-icon" />
  <X16 slot="clear-icon" />
  <div slot="item" let:item>
    <p>{item.label}</p>
  </div>
</Select>

<style>
  :global(.select.elevated) {
    box-shadow: 0px 2px 0px 0px var(--gray-3, #99a8b3);
  }
  :global(.select.elevated.focused) {
    box-shadow: 0px 2px 0px 0px var(--blue-3, #1367d0);
  }
  :global(.select .indicators) {
    fill: var(--gray-5, #233944);
  }
  :global(.select.focused .indicators) {
    fill: var(--blue-5, #053775);
  }
  :global(.select input, .select .selected-item) {
    color: var(--gray-5, #233944);
    font-family: "Source Sans Pro";
    font-size: 1rem;
    font-style: normal;
    line-height: normal;
  }
  :global(.select.focused input, .select.focused .selected-item) {
    color: var(--blue-5, #053775) !important;
  }
</style>
