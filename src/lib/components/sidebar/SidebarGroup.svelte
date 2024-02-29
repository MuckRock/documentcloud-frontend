<script lang="ts">
  import { ChevronDown16 } from "svelte-octicons";

  let collapsed = false;
  function toggle(val: boolean) {
    collapsed = !val;
  }
</script>

<div class="container">
  {#if $$slots.title || $$slots.action}
    <header
      role="button"
      tabindex={0}
      on:click={() => toggle(collapsed)}
      on:keydown={({ key }) => {
        if (["Enter", " "].includes(key)) {
          toggle(collapsed);
        } else if (["ArrowDown", "ArrowRight"].includes(key)) {
          collapsed = false;
        } else if (["ArrowUp", "ArrowLeft"].includes(key)) {
          collapsed = true;
        }
      }}
    >
      <span class="indicator" class:collapsed>
        <ChevronDown16 />
      </span>
      <slot name="title" />
      <slot name="action" />
    </header>
  {/if}
  {#if !collapsed}
    <main>
      <slot />
    </main>
  {/if}
</div>

<style>
  header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: default;
  }
  main {
    display: flex;
    margin: 0.25rem 0;
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
</style>
