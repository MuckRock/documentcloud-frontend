<script lang="ts">
  export let title: string;
  export let name: string;
  export let value: number;
  export let required: boolean = false;
  export let description: string = "";
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

{#if description}
  <p class="help">{description}</p>
{/if}
