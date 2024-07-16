<!-- @component Wraps its content in a presentational card -->

<div class="card">
  <slot />
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding: 1.5rem;
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: var(--shadow-1, 0px 2px 4px 2px rgba(30, 48, 56, 0.15));
  }
</style>