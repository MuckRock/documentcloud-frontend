<script lang="ts">
  import Field from "./Field.svelte";

  export let title: string;
  export let name: string;
  export let value: boolean;
  export let required: boolean = false;
  export let description: string = "";
</script>

<style>
  input {
    order: -1;
    margin: 0;
  }
</style>

<Field {title} {description} {required} inline>
  <input type="checkbox" {name} bind:checked={value} {required} />
</Field>