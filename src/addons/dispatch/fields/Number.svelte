<script lang="ts">
  import Field from "./Field.svelte";

  export let title: string;
  export let name: string;
  export let defaultValue: number = undefined;
  export let value: number = defaultValue;
  export let required: boolean = false;
  export let description: string = "";
  export let min: string | undefined = undefined;
  export let max: string | undefined = undefined;
  export let inline = false;
</script>

<style>
  input {
    flex: 1 1 auto;
  }
</style>

<Field {title} {description} {inline} {required}>
  <input
    type="number"
    {name}
    {required}
    bind:value
    on:change
    on:input
    on:focus
    on:blur
    {min}
    {max}
  />
</Field>
