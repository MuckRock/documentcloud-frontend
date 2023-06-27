<script lang="ts">
  export let title: string;
  export let name: string;
  export let value: boolean;
  export let required: boolean = false;
  export let description: string = "";
</script>

<label>
  {title}
  <input type="checkbox" {name} bind:checked={value} {required} />
</label>

{#if description}
  <p class="help">{description}</p>
{/if}
