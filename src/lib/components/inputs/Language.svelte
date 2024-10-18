<script lang="ts">
  import Select from "./Select.svelte";
  import {
    DEFAULT_LANGUAGE,
    LANGUAGE_CODES,
    LANGUAGE_NAMES,
  } from "@/config/config.js";

  interface Item {
    label: string;
    value: any;
  }

  export let name = "language";
  export let value: string | string[] | Item = DEFAULT_LANGUAGE;
  export let required = false;
  export let placeholder: string = "";
  export let multiple = false;

  const items = LANGUAGE_CODES.map((code, i) => ({
    value: code,
    label: LANGUAGE_NAMES[i],
  }));
</script>

<Select {name} {items} {required} {placeholder} {multiple} bind:value />
