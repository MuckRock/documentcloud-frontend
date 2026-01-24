<script lang="ts">
  import type { Snippet } from "svelte";
  import { createBubbler, stopPropagation } from "svelte/legacy";

  const bubble = createBubbler();
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { ChevronDown16 } from "svelte-octicons";

  interface Props {
    collapsed?: boolean;
    name?: string | undefined;
    title?: Snippet;
    action?: Snippet;
    children?: Snippet;
  }

  let {
    collapsed = $bindable(false),
    name = undefined,
    title,
    action,
    children,
  }: Props = $props();

  let key = $derived(`SidebarGroup:${name}`);

  function toggle(val: boolean) {
    collapsed = !val;
    if (name && browser) {
      localStorage.setItem(key, String(collapsed));
    }
  }

  function onClick() {
    toggle(collapsed);
  }

  function onKeydown({ key }) {
    if (["Enter", " "].includes(key)) {
      toggle(collapsed);
    } else if (["ArrowDown", "ArrowRight"].includes(key)) {
      collapsed = false;
    } else if (["ArrowUp", "ArrowLeft"].includes(key)) {
      collapsed = true;
    }
  }

  onMount(() => {
    if (name) {
      collapsed = localStorage.getItem(key) === "true";
    }
  });
</script>

<div class="container" id={name}>
  {#if title || action}
    <header role="button" tabindex={0} onclick={onClick} onkeydown={onKeydown}>
      <span class="indicator" class:collapsed>
        <ChevronDown16 />
      </span>
      {#if title}<span class="title">{@render title?.()}</span>{/if}
      {#if action}
        <span
          role="button"
          tabindex="0"
          onclick={stopPropagation(bubble("click"))}
          onkeydown={stopPropagation(bubble("keydown"))}
        >
          {@render action?.()}
        </span>{/if}
    </header>
  {/if}
  {#if !collapsed}
    <main>
      {@render children?.()}
    </main>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 1rem;
  }
  header {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: default;
  }
  main {
    flex: 1 1 0;
    display: flex;
    padding: 0.25rem;
    flex-direction: column;
    align-self: stretch;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
  }
  .indicator {
    height: 1rem;
    width: 1rem;
    transition: transform 0.125s ease-in-out;
  }
  .indicator.collapsed {
    transform: rotate(-90deg);
  }
  .title {
    flex: 1 0 0;
  }
</style>
