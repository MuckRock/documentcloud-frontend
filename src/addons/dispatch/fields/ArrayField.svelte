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

  export let value = Array(count).fill(null);

  // only one level of nesting allowed
  const types = {
    string: Text,
    number: Number,
    integer: Number,
    boolean: Checkbox,
  };

  function push() {
    value = [...value, null];
  }

  function remove(n: number) {
    value.splice(n, 1);
    value = value;
  }
</script>

<style></style>

{#if title}
  <legend>{title}</legend>
{/if}
{#each value as v, i}
  <div class="item item-{i}">
    <svelte:component
      this={types[items.type]}
      bind:value={value[i]}
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
