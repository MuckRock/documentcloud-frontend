<script lang="ts">
  import Checkbox from "./Checkbox.svelte";
  import Number from "./Number.svelte";
  import Text from "./Text.svelte";

  export let name: string = "";
  export let title: string = "";
  export let description: string = "";
  export let items: any = {
    type: "string",
    title: "",
  };

  export let count: number = 1;

  export let values = Array(count).fill(null);

  // only one level of nesting allowed
  const types = {
    string: Text,
    number: Number,
    integer: Number,
    boolean: Checkbox,
  };

  function push() {
    values = [...values, null];
  }

  function remove(n: number) {
    values.splice(n, 1);
    values = values;
  }
</script>

<style></style>

{#if title}
  <legend>{title}</legend>
{/if}
{#each values as value, i}
  <div class="item item-{i}">
    <svelte:component
      this={types[items.type]}
      bind:value={values[i]}
      {...items}
      name="{name}.{i}"
    />

    {#if i !== 0}
      <button class="remove" on:click|preventDefault={(e) => remove(i)}
        >x
      </button>
    {/if}
  </div>
{/each}

<div class="array-controls">
  <button class="add" on:click|preventDefault={push}>+</button>
</div>

{#if description}
  <p class="help">{description}</p>
{/if}
