<script lang="ts">
  import { createEventDispatcher } from "svelte";

  // Components
  import Hamburger from "../../../common/Hamburger.svelte";
  import Logo from "../../../common/Logo.svelte";

  import DocumentFilters from "./DocumentFilters.svelte";

  import AddonSidebar from "./addons/AddonList.svelte";
  import ProjectList from "./projects/ProjectList.container.svelte";

  import { orgsAndUsers } from "../../../manager/orgsAndUsers.js";

  // TODO: Make sidebar state internal
  const dispatch = createEventDispatcher();

  export let expanded;
</script>

<aside class="sidebar" class:expanded>
  <header>
    <Hamburger on:toggle={(e) => dispatch("retractSidebar")} />
    <Logo />
  </header>

  <DocumentFilters user={$orgsAndUsers.me} />

  {#if $orgsAndUsers.me !== null}
    <ProjectList on:retractSidebar />
    <AddonSidebar />
  {/if}

  <!-- todo get rid of this -->
  <div class="sidebarbg" />
</aside>

<style>
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    overflow: auto;
    width: var(--sidebar-width, 272px);
    -webkit-overflow-scrolling: touch;
  }

  .sidebarbg {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: var(--sidebarBg);
    width: var(--sidebar-width, 272px);
    background: var(--sidebar, #edeeef);
    box-shadow: 2px 0px 4px rgba(0, 0, 0, 0.12);
  }

  .sidebar header {
    padding: 20px 0;
  }

  @media only screen and (max-width: 720px) {
    .sidebar {
      display: none;
      width: 100vw;
      overflow-y: auto;
      height: 100%;
    }

    .sidebarbg {
      width: 100vw;
      box-shadow: none;
    }

    .sidebar.expanded {
      display: block;
      position: fixed;
    }
  }
</style>
