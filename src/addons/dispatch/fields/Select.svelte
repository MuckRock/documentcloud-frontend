<script lang="ts">
  import Field from "./Field.svelte";

  export let title: string;
  export let name: string;
  export let defaultValue: string = "";
  export let value: string = defaultValue || null;
  export let required: boolean = false;
  export let description: string = "";
  export let inline = false;
  export let choices: string[] = [];
</script>

<Field {title} {description} {inline} {required}>
  <select {name} bind:value on:input on:focus on:change on:blur>
    {#if !required}
      <option value="">---</option>
    {/if}
    {#each choices as choice}
      <option value={choice}>{choice}</option>
    {/each}
  </select>
</Field>
