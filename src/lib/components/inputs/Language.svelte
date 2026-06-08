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

  interface Props {
    name?: string;
    value?: Item;
    required?: boolean;
    placeholder?: string;
  }

  let {
    name = "language",
    value = $bindable({
      value: DEFAULT_LANGUAGE,
      label: LANGUAGE_MAP.get(DEFAULT_LANGUAGE) ?? DEFAULT_LANGUAGE,
    }),
    required = false,
    placeholder = "Language",
  }: Props = $props();

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
