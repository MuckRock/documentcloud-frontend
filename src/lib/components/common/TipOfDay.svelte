<script lang="ts" context="module">
  import DOMPurify from "isomorphic-dompurify";
  import { writable } from "svelte/store";

  import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";
  import { StorageManager } from "$lib/utils/storage";

  let show = writable(false);

  const storage = new StorageManager("tip-of-day");

  export function showTip(message: string): boolean {
    return message === storage.get("message")
      ? (storage.get<boolean, boolean>("show", true) ?? true)
      : true;
  }

  function hideTip(message: string) {
    show.set(false);
    storage.set("message", message);
    storage.set("show", false);
  }

  function clean(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { X12 } from "svelte-octicons";

  export let message: string;

  onMount(() => {
    $show = showTip(message);
  });
</script>

{#if $show}
  <div class="container">
    <div class="message">
      {@html clean(message ?? "")}
    </div>
    <button class="close" title="Hide Tip" on:click={() => hideTip(message)}>
      <X12 />
    </button>
  </div>
{/if}

<style>
  .container {
    padding: 0.25rem 1rem;
    text-align: center;
    font-size: var(--font-s);
    background: var(--green-1);
    color: var(--green-5);
    display: flex;
    justify-content: center;
    align-items: baseline;
    position: relative;
  }
  .message {
    flex: 1 1 auto;
    line-height: 1.5;
    max-width: 80rem;
    padding: 0 1.5rem;
  }
  .close {
    position: absolute;
    right: 1rem;
    appearance: none;
    border: none;
    background: none;
    color: var(--green-4);
    fill: var(--green-4);
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .close:hover,
  .close:focus {
    background: var(--green-2);
  }
</style>
