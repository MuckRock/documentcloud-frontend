<script lang="ts">
  export let title: string;
  export let name: string;
  export let value: number;
  export let required: boolean = false;
</script>

<label>
  {title}
  <input
    type="number"
    {name}
    {required}
    bind:value
    on:change
    on:input
    on:focus
    on:blur
  />
</label>
