<!-- lib/components/layouts/Portal.svelte -->
<!-- Source: https://github.com/sveltejs/svelte/issues/3088#issuecomment-1065827485 -->

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let target: HTMLElement | null | undefined = globalThis.document?.body;

  let ref: HTMLElement;

  onMount(() => {
    if (target) {
      target.appendChild(ref);
    }
  });

  onDestroy(() => {
    if (target) {
      target.removeChild(ref);
    }
  });
</script>

<div bind:this={ref} style="display:contents;">
  <slot />
</div>
