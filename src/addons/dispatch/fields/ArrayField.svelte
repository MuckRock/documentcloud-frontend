<script lang="ts">
  import { beforeUpdate } from "svelte";
  import Plus16 from "svelte-octicons/lib/Plus16.svelte";

  import Checkbox from "./Checkbox.svelte";
  import X16 from "svelte-octicons/lib/X16.svelte";
  import Number from "./Number.svelte";
  import Text from "./Text.svelte";
  import Button from "../../../common/Button.svelte";

  export let name: string = "";
  export let title: string = "";
  export let description: string = "";
  export let items: any = {
    type: "string",
    title: "",
  };

  export let count: number = 1;
  export let value: any[] = Array(count).fill(null);

  $: numItems = value?.length ?? 0;

  beforeUpdate(() => {
    // value should always be an array
    if (!Array.isArray(value)) {
      value = [];
    }
  });

  // only one level of nesting allowed
  const types = {
    string: Text,
    number: Number,
    integer: Number,
    boolean: Checkbox,
  };

  function push(event: Event) {
    event.preventDefault();
    value = [...value, null];
  }

  function remove(event: Event, index: number) {
    event.preventDefault();
    value.splice(index, 1);
    value = value;
  }
</script>

<fieldset class={items.type}>
  {#if title}
    <legend>{title}</legend>
  {/if}
  {#each value as v, i}
    <div class="item item-{i}">
      <svelte:component
        this={types[items.type]}
        bind:value={value[i]}
        {...items}
        inline
        name="{name}.{i}"
      />

      {#if numItems > 1}
        <Button action on:click={(e) => remove(e, i)}><X16 /></Button>
      {/if}
    </div>
  {/each}

  <div class="array-controls">
    <Button on:click={push}><Plus16 fill="white" /></Button>
  </div>
</fieldset>

{#if description}
  <p class="help">{description}</p>
{/if}

<style>
  fieldset {
    padding: 0.5em;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius);
  }
  legend {
    font-weight: 600;
    padding: 0 0.5em;
  }
  .array-controls {
    padding: 0 0.5em;
  }
  .item {
    min-height: 1.75em;
    padding: 0.5em;
    display: flex;
    gap: 0.5em;
    align-items: center;
    justify-content: space-between;
    border-radius: var(--radius);
  }
  .boolean .item {
    padding: 0 0.5em;
  }
  .item:hover {
    background: rgba(0, 0, 0, 0.025);
  }
  .help {
    margin: 0.5em 1rem;
    font-size: 0.8em;
    color: var(--gray);
  }
</style>
