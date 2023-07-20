<script lang="ts">
  import { getContext } from "svelte";

  export let title: string;
  export let name: string;
  export let value: string;
  export let required: boolean = false;
  export let placeholder: string = "";
  export let description: string = "";
</script>

<label>
  {title}
  <input
    type="text"
    {name}
    {required}
    {placeholder}
    bind:value
    on:change
    on:input
    on:focus
    on:blur
  />
</label>

{#if description}
  <p class="help">{description}</p>
{/if}
