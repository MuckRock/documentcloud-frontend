<script>
  export let width;
  export let aspect;

  let height;

  $: if (height != null) {
    aspect = height / width;
  }
</script>

<style lang="scss">
  div {
    font-size: 12px;
  }
</style>

<div bind:clientHeight={height}>
  <slot />
</div>
