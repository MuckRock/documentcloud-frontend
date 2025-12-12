<script lang="ts">
  import Select from "./Select.svelte";
  import {
    DEFAULT_LANGUAGE,
    LANGUAGE_CODES,
    LANGUAGE_NAMES,
    LANGUAGE_MAP,
  } from "@/config/config.js";

  interface Item {
    label: string;
    value: any;
  }

  export let name = "language";
  export let value: Item = {
    value: DEFAULT_LANGUAGE,
    label: LANGUAGE_MAP.get(DEFAULT_LANGUAGE),
  };
  export let required = false;
  export let placeholder: string = "Language";
  export let multiple = false;

  const options = LANGUAGE_CODES.map((code, i) => ({
    value: code,
    label: LANGUAGE_NAMES[i],
  }));
</script>

<Select
  {name}
  {options}
  {required}
  {placeholder}
  {multiple}
  valueField="value"
  labelField="label"
  bind:value
  valueAsObject
/>
