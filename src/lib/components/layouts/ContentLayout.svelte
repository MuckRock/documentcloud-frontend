<div class="container">
  {#if $$slots.header}
    <header>
      <slot name="header" />
    </header>
  {/if}
  <main>
    <slot />
  </main>
  {#if $$slots.footer}
    <footer>
      <slot name="footer" />
    </footer>
  {/if}
</div>

<style>
  .container {
    display: flex;
    padding: 0;
    flex-direction: column;
    flex: 1 0 0;
    align-self: stretch;
    position: relative;
    width: 100%;
    height: auto;
    min-height: 100%;
  }
  header {
    flex: 0 0 0;
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 0.625rem;
  }
  main {
    flex: 1 0 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  footer {
    flex: 0 0 0;
    width: 100%;
    position: sticky;
    bottom: 0;
    z-index: 2;
    padding: 0.625rem;
  }
</style>
