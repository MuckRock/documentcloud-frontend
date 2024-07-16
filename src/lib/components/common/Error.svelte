<script lang="ts">
  import { Alert24 } from "svelte-octicons";
</script>

<div class="container">
  <Alert24 height={32} width={32} />
  <slot />
</div>

<style>
  .container {
    display: flex;
    padding: 1.5rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--red-dark, #5d275f);
    fill: var(--red, #e1275f);

    text-align: center;
    font-size: var(--font-sm, 0.875rem);
  }
</style>
