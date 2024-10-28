<script lang="ts">
  export let name: string;
  export let defaultValue: string = "";
  export let value: null | string = defaultValue || null;
  export let required: boolean = false;
  export let choices: string[] = [];
</script>

<select {required} {name} bind:value on:input on:focus on:change on:blur>
  {#if !required}
    <option value="">---</option>
  {/if}
  {#each choices as choice}
    <option value={choice}>{choice}</option>
  {/each}
</select>
