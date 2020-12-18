<script>
  export let descriptor;

  $: transform = descriptor.toTransform();
</script>

<style lang="scss">
  .modification {
    display: inline-block;
  }
</style>

<span class="modification" style="transform: {transform}">
  <slot />
</span>
