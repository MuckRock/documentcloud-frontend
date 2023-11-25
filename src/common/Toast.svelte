<script lang="ts" context="module">
  import { writable } from "svelte/store";

  let nextId = 0;

  export interface Toast {
    idx: number;
    content: string;
    status?: "info" | "success" | "warning" | "error";
  }

  export const toasts = writable([]);

  export function dismiss(i: number) {
    toasts.update((t) => {
      t.splice(i);
      return t;
    });
  }

  export function pushToast(content, status = "info") {
    toasts.update((t) => {
      t.push({
        idx: nextId++,
        content,
        status,
      });

      return t;
    });
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import CloseIcon from "svelte-octicons/lib/X16.svelte";

  // Constants
  const toastLength = parseInt(import.meta.env.DC_TOAST_LENGTH);
  const toastFade = parseInt(import.meta.env.DC_TOAST_FADE);

  export let toast: Toast;
  export let i: number;
  export let fade = true;
  export let onClose = () => {};
  export let onReset = () => {};
  export let onCancel = () => {};

  let toastTimeout = null;
  let fading = false;

  function beginClose() {
    fading = true;
    toastTimeout = setTimeout(close, toastFade);
  }

  function close() {
    onClose();
    dismiss(i);
  }

  function cancel() {
    onCancel();
    if (toastTimeout != null) {
      clearTimeout(toastTimeout);
    }
  }

  function reset() {
    onReset();
    fading = false;

    cancel();
    if (fade) {
      toastTimeout = setTimeout(beginClose, toastLength);
    }
  }

  onMount(() => {
    if (fade) {
      toastTimeout = setTimeout(beginClose, toastLength);
    }
  });
</script>

<style lang="scss">
  .toast {
    padding: 5px 10px;
    margin: 10px;
    border-radius: 3px;
    box-shadow: 0 0 2px #0000003d;
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5em;
    max-width: 50ch;
    text-align: left;
    pointer-events: all;
    opacity: 1;
    transition: opacity 0.8s ease;
  }

  .toast.fading {
    opacity: 0;
  }

  .info {
    border: solid 1px $primary;
    background: mix($primary, white, 10%);
    color: mix($primary, black, 30%);
    fill: mix($primary, black, 30%);
  }

  .info:hover {
    background: rgba(mix($primary, white, 30%), 0.95);
  }

  .success {
    border: solid 1px $tertiary;
    background: mix($tertiary, white, 10%);
    color: mix($tertiary, black, 30%);
    fill: mix($tertiary, black, 30%);
  }

  .success:hover {
    background: rgba(mix($tertiary, white, 30%), 0.95);
  }

  .warning {
    border: solid 1px $annotationBorder;
    background: mix($annotationBorder, white, 30%);
    color: mix($annotationBorder, black, 30%);
    fill: mix($annotationBorder, black, 30%);
  }

  .warning:hover {
    background: rgba(mix($annotationBorder, white, 30%), 0.95);
  }

  .error {
    border: solid 1px $caution;
    background: mix($caution, white, 10%);
    color: mix($caution, black, 30%);
    fill: mix($caution, black, 30%);
  }

  .error:hover {
    background: rgba(mix($caution, white, 30%), 0.95);
  }

  .close {
    align-items: center;
    cursor: pointer;
    background: none;
    border: none;
    display: flex;
    flex: 0 0 auto;
    height: 1.5em;
    width: 1.5em;
    justify-content: center;
    padding: 0;
    margin: 0;
    border-radius: 1.5em;
  }

  .close:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .content {
    flex: 1 1 auto;
    margin: 0;
    user-select: none;
  }
</style>

<div
  class={["toast", toast.status ?? "info"].join(" ")}
  class:fading
  on:mouseenter={cancel}
  on:mouseleave={reset}
>
  <button class="close" on:click={close}><CloseIcon /></button>
  <p class="content">{toast.content}</p>
</div>
