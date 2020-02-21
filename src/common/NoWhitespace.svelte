<script>
  import { beforeUpdate } from "svelte";

  let elem;

  beforeUpdate(() => {
    if (elem == null) return;
    for (let i = elem.childNodes.length - 1; i >= 0; i--) {
      if (elem.childNodes[i].nodeType == Node.TEXT_NODE) {
        elem.removeChild(elem.childNodes[i]);
      }
    }
  });
</script>

<span bind:this={elem}>
  <slot />
</span>
