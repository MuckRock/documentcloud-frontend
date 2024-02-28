<script lang="ts">
  export let disabled = false;
</script>

<div class="container" class:disabled>
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

    font-size: 1rem;
    font-weight: var(--font-semibold, 600);

    cursor: pointer;
  }
  .container:hover {
    background: var(--gray-2, #d8dee2);
  }
  @media (hover: none) {
    .container:hover {
      background: transparent;
    }
  }
  .container.disabled {
    pointer-events: none;
    cursor: default;
    opacity: 0.5;
  }
  .container.disabled:hover {
    background: transparent;
  }
</style>
