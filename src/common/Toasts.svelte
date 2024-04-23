<script lang="ts">
  import Toast, { toasts } from "./Toast.svelte";
</script>

<div class="toastcontainer">
  {#each $toasts as toast, i (toast.idx)}
    <Toast {toast} {i} />
  {/each}
</div>

<style>
  .toastcontainer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: var(--mainToastZ, 23);
    pointer-events: none;
  }
</style>
