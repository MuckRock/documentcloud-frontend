<script>
  import { onMount } from "svelte";

  export let value;
  export let min;
  export let max;
  let input;
  let valueInternal;

  onMount(() => {
    valueInternal = parseInt(value);
  });

  $: {
    const number = parseInt(valueInternal);
    if (number == null || isNaN(number)) {
      value = min;
    } else if (number < min) {
      value = min;
    } else if (number > max) {
      value = max;
    } else {
      value = number;
    }
  }

  function handleBlur() {
    if (input != null && value != valueInternal) {
      input.value = value;
    }
  }
</script>

<input
  bind:this={input}
  type="number"
  {min}
  {max}
  bind:value={valueInternal}
  on:blur={handleBlur}
/>
