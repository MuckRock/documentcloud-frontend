<script lang="ts">
  import OrgMenu from "./OrgMenu.svelte";
  import Logo from "./common/Logo.svelte";
  import { SidebarCollapse16, SidebarExpand16 } from "svelte-octicons";
</script>

<div class="container">
  <nav class="navigation small">
    <a href="#navigation"><SidebarCollapse16 /></a>
    <a href="/" class="logo"><Logo /></a>
    <a href="#action"><SidebarExpand16 /></a>
  </nav>
  <nav class="navigation large" id="navigation">
    <header class="header">
      <a href="/" class="logo"><Logo /></a>
    </header>
    <main><slot name="navigation" /></main>
  </nav>
  <main class="content">
    <slot name="content" />
  </main>
  <nav class="action large" id="action">
    <header class="header">
      <OrgMenu />
    </header>
    <main><slot name="action" /></main>
    <footer>
      <p>Allan Lasser</p>
      <p>Language</p>
      <p>Help</p>
    </footer>
  </nav>
</div>

<style>
  .container {
    display: flex;
    width: 100vw;
    height: 100vh;
    gap: 0;
    flex-shrink: 0;
    background: var(--gray-1, #f5f6f7);
  }
  header {
    display: flex;
    padding: 1rem;
    gap: 0.5rem;
    align-items: flex-start;
    align-self: stretch;
    border-bottom: 1px solid var(--gray-2, #d8dee2);
  }
  main {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 2rem;
    flex: 1 0 0;
    max-height: 100%;
    overflow-y: auto;
  }
  nav {
    flex: 1 0 0;
    min-width: 16rem;
    max-width: 18rem;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .logo {
    height: 2rem;
    width: auto;
  }
  .content {
    padding: 4.0625rem 0;
  }
  .navigation {
    border-right: 1px solid var(--gray-2, #d8dee2);
  }
  .action {
    border-left: 1px solid var(--gray-2, #d8dee2);
  }
  .action footer {
    display: flex;
    width: 100%;
    position: sticky;
    bottom: 0;
    padding: 1rem;
    z-index: 1;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.875rem;
    border-top: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  nav.small {
    display: none;
    flex: 0 0 0;
    max-width: unset;
  }

  /* Mobile Styles */
  @media (max-width: 64rem) {
    .container {
      flex-direction: column;
    }
    nav.large {
      display: none;
    }
    nav.small {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.5rem;
    }
    nav.small .logo {
      flex: 1 0 0;
      height: 1.5rem;
      width: auto;
    }
    nav.small a {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    nav.small svg {
      display: block;
    }
  }
</style>
