<script>
  import { onMount } from "svelte";

  export let width;
  export let aspect;

  let height = null;
  let elem;

  export const update = () => {
    // TODO: update size on changes
  };

  $: if (height != null) {
    aspect = height / width;
  }

  function updateSize() {
    height = elem.offsetHeight;
  }

  onMount(() => {
    updateSize();
  });
</script>

<style lang="scss">
  div {
    font-size: 12px;
    position: relative;
  }
</style>

<div bind:this={elem}>
  <slot {update} />
</div>
