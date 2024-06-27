<!-- @component Wraps its content in a presentational card -->

<div class="card">
  <slot />
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 40rem;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    padding: 1.5rem;
    border-radius: var(--font-md, 1rem);
    background: var(--white, #fff);
    box-shadow: 0px 4px 16px 4px #99a8b3;
  }
</style>