<script lang="ts">
  import Field from "./Field.svelte";

  export let title: string;
  export let name: string;
  export let value: string;
  export let required: boolean = false;
  export let placeholder: string = "";
  export let description: string = "";
  export let inline = false;
</script>

<style>
  input {
    flex: 1 1 auto;
    max-width: 100%;
  }
</style>

<Field {title} {description} {inline} {required}>
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
</Field>