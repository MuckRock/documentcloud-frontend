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
    value: string;
  }

  export let name = "language";
  export let value: Item = {
    value: DEFAULT_LANGUAGE,
    label: LANGUAGE_MAP.get(DEFAULT_LANGUAGE) ?? DEFAULT_LANGUAGE,
  };
  export let required = false;
  export let placeholder: string = "Language";

  const options: Item[] = LANGUAGE_CODES.map((code, i) => ({
    value: code,
    label: LANGUAGE_NAMES[i] ?? code,
  }));
</script>

<Select
  {name}
  {options}
  {required}
  {placeholder}
  valueField="value"
  labelField="label"
  bind:value
  valueAsObject
/>
