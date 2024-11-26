<script lang="ts" context="module">
  import type { ComponentType } from "svelte";
  import { writable } from "svelte/store";

  type ToastContents = string | ComponentType;

  interface ToastOptions<P = any> {
    status?: "info" | "success" | "warning" | "error";
    lifespan?: number | null;
    props?: P;
  }

  interface ToastItem extends ToastOptions {
    id?: string | number;
    contents: ToastContents;
  }

  function addToast(newToast: ToastItem, prev: ToastItem[]) {
    const id = Date.now();
    return [...prev, { ...newToast, id }];
  }

  export const toasts = writable<ToastItem[]>([]);

  export function toast<P>(
    contents: ToastContents,
    options: ToastOptions<P> = {},
  ) {
    toasts.update((prev) => addToast({ contents, ...options }, prev));
  }
</script>

<script lang="ts">
  import { flip } from "svelte/animate";
  import Toast from "$lib/components/common/Toast.svelte";
</script>

<div id="toaster">
  {#each $toasts as toast (toast.id)}
    <div animate:flip>
      <Toast
        id={toast.id}
        status={toast.status}
        lifespan={toast.lifespan}
        on:close={() => {
          toasts.update((prev) =>
            prev.filter((eachToast) => eachToast.id !== toast.id),
          );
        }}
      >
        {#if typeof toast.contents === "string"}
          {toast.contents}
        {:else}
          <svelte:component this={toast.contents} {...toast.props} />
        {/if}
      </Toast>
    </div>
  {/each}
</div>

<style>
  #toaster {
    position: fixed;
    top: 1rem;
    right: 50%;
    transform: translateX(50%);
    z-index: var(--z-toast);
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 48rem;
    min-width: 24rem;
  }
</style>
