<script>
  export let x;
  export let y;
  export let width;
  export let height;
</script>

<style lang="scss">
  .page {
    background: gainsboro;
    position: absolute;
  }
</style>

<div
  class="page"
  style="left: {x}px; top: {y}px; width: {width}px; height: {height}px" />
