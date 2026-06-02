<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    name: string;
    defaultValue?: string;
    value?: null | string;
    required?: boolean;
    choices?: string[];
  }

  let {
    name,
    defaultValue = "",
    value = $bindable(defaultValue || null),
    required = false,
    choices = [],
  }: Props = $props();
</script>

<select {required} {name} bind:value>
  {#if !required}
    <option value="">---</option>
  {/if}
  {#each choices as choice}
    <option value={choice}>{choice}</option>
  {/each}
</select>
