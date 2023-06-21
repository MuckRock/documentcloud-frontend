<script lang="ts">
  export let label: string;
  export let path: string;
  export let value: string;
  export let required: boolean = false;
</script>

<label>
  {label}
  <input
    type="text"
    name={path}
    {required}
    bind:value
    on:change
    on:input
    on:focus
    on:blur
  />
</label>
