<script>
  import Toast from "./Toast";
  import { toasts } from "@/manager/toast";
  import { flip } from "svelte/animate";
</script>

<style lang="scss">
  .toastcontainer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: $mainToastZ;
    pointer-events: none;
  }
</style>

<div class="toastcontainer">
  {#each $toasts.toasts as toast, i (toast.idx)}
    <div animate:flip={{ duration: 400 }}>
      <Toast {toast} {i} />
    </div>
  {/each}
</div>
