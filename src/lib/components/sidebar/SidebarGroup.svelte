<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { ChevronDown16 } from "svelte-octicons";

  export let collapsed = false;
  export let name: string | undefined = undefined;

  $: key = `SidebarGroup:${name}`;

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
  {#if $$slots.title || $$slots.action}
    <header
      role="button"
      tabindex={0}
      on:click={onClick}
      on:keydown={onKeydown}
    >
      <span class="indicator" class:collapsed>
        <ChevronDown16 />
      </span>
      {#if $$slots.title}<span class="title"><slot name="title" /></span>{/if}
      {#if $$slots.action}<span
          role="button"
          tabindex="0"
          on:click|stopPropagation
          on:keydown|stopPropagation><slot name="action" /></span
        >{/if}
    </header>
  {/if}
  {#if !collapsed}
    <main>
      <slot />
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
