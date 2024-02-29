<script lang="ts">
  export let disabled = false;
  export let hover = false;
  export let small = false;
</script>

<div class="container" class:hover class:disabled class:small>
  <slot />
</div>

<style>
  .container {
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.25rem;

    color: var(--gray-5, #233944);
    fill: var(--gray-5, #233944);
    background: transparent;

    font-size: var(--font-m, 1rem);
    font-weight: var(--font-semibold, 600);
  }

  /* Small */
  .container.small {
    font-size: var(--font-s, 0.875rem);
  }

  /* Disabled */
  .container.disabled {
    pointer-events: none;
    cursor: default;
    opacity: 0.5;
  }

  /* Hover */
  .container.hover {
    cursor: pointer;
  }
  .container.hover:hover {
    background: var(--gray-2, #d8dee2);
  }
  @media (hover: none) {
    .container.hover:hover {
      background: transparent;
    }
  }
  .container.disabled.hover:hover {
    background: transparent;
    cursor: default;
  }
</style>
