<script>
  export let transform;
  export let x1;
  export let y1;
  export let x2;
  export let y2;

  $: topLeft = transform.project([x1, y1]);
  $: bottomRight = transform.project([x2, y2]);
  $: width = bottomRight[0] - topLeft[0];
  $: height = bottomRight[1] - topLeft[1];
</script>

<style lang="scss">
  .page {
    position: absolute;
    background: rgb(216, 216, 216);
  }
</style>

<div
  class="page"
  style="left: {topLeft[0]}px; top: {topLeft[1]}px; width: {width}px; height: {height}px" />
