<!-- lib/components/layouts/Portal.svelte -->
<!-- Source: https://github.com/sveltejs/svelte/issues/3088#issuecomment-1065827485 -->

<script lang="ts">
  import type { Maybe } from "$lib/api/types";
  import type { Snippet } from "svelte";
  import { onMount, onDestroy } from "svelte";

  interface Props {
    target?: HTMLElement | null | undefined;
    children?: Snippet;
  }

  let { target = globalThis.document?.body, children }: Props = $props();

  let ref: Maybe<HTMLElement> = $state();

  onMount(() => {
    if (target && ref) {
      target.appendChild(ref);
    }
  });

  onDestroy(() => {
    if (target && ref && target.contains(ref)) {
      target.removeChild(ref);
    }
  });
</script>

<div bind:this={ref} style="display:contents;">
  {@render children?.()}
</div>
