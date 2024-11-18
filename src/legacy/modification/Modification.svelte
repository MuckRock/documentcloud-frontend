<script>
  export let descriptor;

  $: transform = descriptor.toTransform();
</script>

<span class="modification" style="transform: {transform}">
  <slot />
</span>

<style lang="scss">
  .modification {
    display: inline-block;
    transform-origin: top left;
  }
</style>
