<script>
  // Whether the title should be a little smaller
  export let small = false;
  export let inline = false;
</script>

<style scoped>
  .primary {
    font-weight: 600;
    font-size: 18px;
    padding-right: 33px;
    display: inline-block;
    vertical-align: middle;
  }

  .small {
    font-size: 16px;
    padding-right: 33px;
  }

  .inline {
    display: inline;
  }
</style>

<!-- todo use a proper H tag -->
<div class="primary" class:small class:inline>
  <slot />
</div>
