<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fly } from "svelte/transition";
  import CloseIcon from "svelte-octicons/lib/X16.svelte";
  import {
    Circle16,
    CheckCircle16,
    Info16,
    Alert16,
    Stop16,
    type SvgComponent,
  } from "svelte-octicons";

  import { TOAST_LENGTH } from "@/config/config.js";

  export let id: string | number = undefined;
  export let status: "info" | "success" | "warning" | "error" = undefined;
  export let lifespan: number | null = TOAST_LENGTH;

  let toastTimeout = null;

  const statusIcons: Record<typeof status | "undefined", typeof SvgComponent> =
    {
      undefined: Circle16,
      info: Info16,
      success: CheckCircle16,
      warning: Alert16,
      error: Stop16,
    };

  const dispatch = createEventDispatcher();

  function close() {
    dispatch("close");
  }

  function cancel() {
    dispatch("cancel");
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
  }

  function reset() {
    dispatch("reset");
    cancel();
    if (Boolean(lifespan)) {
      toastTimeout = setTimeout(close, lifespan);
    }
  }

  onMount(() => {
    if (Boolean(lifespan)) {
      toastTimeout = setTimeout(close, lifespan);
    }
  });
</script>

<div
  id={`toast-${id}`}
  class={["toast", status].join(" ")}
  on:mouseenter={cancel}
  on:mouseleave={reset}
  role="dialog"
  transition:fly={{ duration: 750, easing: quintOut, y: 20 }}
>
  <div class="icon">
    <svelte:component this={statusIcons[String(status)]} />
  </div>
  <button class="close" on:click={close}><CloseIcon /></button>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .toast {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-3);
    display: inline-flex;
    align-items: flex-start;
    width: 100%;
    text-align: left;
    pointer-events: all;

    /* Default colors */
    background: var(--white);
    border: solid 1px var(--gray-2);
    fill: var(--gray-4);
    color: var(--gray-5);
  }

  .info {
    background: var(--blue-1);
    border-color: var(--blue-2);
    fill: var(--blue-4);
    color: var(--blue-5);
  }

  .success {
    background: var(--green-1);
    border-color: var(--green-2);
    fill: var(--green-4);
    color: var(--green-5);
  }

  .warning {
    background: var(--yellow-1);
    border-color: var(--yellow-2);
    fill: var(--yellow-4);
    color: var(--yellow-5);
  }

  .error {
    background: var(--red-1);
    border-color: var(--red-2);
    fill: var(--red-4);
    color: var(--red-5);
  }

  .close {
    order: 1;
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    display: flex;
    flex: 0 0 auto;
    height: 1.5rem;
    width: 1.5rem;
    justify-content: center;
    padding: 0;
    margin: 0;
    border-radius: 1.5em;
    opacity: 0.75;
  }

  .close:hover {
    opacity: 1;
  }

  .icon {
    flex: 0 0 auto;
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.75;
    fill: var(--gray-3);
  }

  .info .icon {
    fill: var(--blue-3);
  }
  .success .icon {
    fill: var(--green-3);
  }
  .warn .icon {
    fill: var(--yellow-3);
  }
  .error .icon {
    fill: var(--error-3);
  }

  .close:hover {
    background: var(--gray-2);
  }

  .info .close:hover {
    background: var(--blue-2);
  }

  .success .close:hover {
    background: var(--green-2);
  }

  .warning .close:hover {
    background: var(--yellow-2);
  }

  .error .close:hover {
    background: var(--red-2);
  }

  .content {
    padding: 0 0.5rem;
    line-height: 1.5;
    flex: 1 1 auto;
    margin: 0;
    user-select: none;
  }
</style>
