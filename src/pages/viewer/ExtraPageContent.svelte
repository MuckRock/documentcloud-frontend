<script>
  import { tick } from "svelte";

  export let page;
  export let width;
  export let resizeCallback;
  export let mutators;

  let elem;

  let extraHeight = null;

  $: {
    // Trigger updates
    page;
    width;
    mutators;
    (async () => {
      if (elem != null) {
        await tick();
        if (elem != null) {
          extraHeight = elem.offsetHeight;
          if (extraHeight != null) {
            resizeCallback(extraHeight / width, width);
          }
        }
      }
    })();
  }
</script>

<style lang="scss">
  div {
    position: relative;
    overflow-wrap: break-word;
  }
</style>

<div class="extrapagecontent" bind:this={elem}>
  <slot />
</div>
