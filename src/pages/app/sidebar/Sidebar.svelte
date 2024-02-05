<script lang="ts">
  import { writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import Hamburger from "../../../common/Hamburger.svelte";
  import Logo from "../../../common/Logo.svelte";
  import { SidebarExpand24, SidebarCollapse24 } from "svelte-octicons";

  import DocumentFilters from "./DocumentFilters.svelte";

  import AddonList from "./addons/AddonList.svelte";
  import ProjectList from "./projects/ProjectList.svelte";

  import { browseProjects, editProject } from "../../../manager/layout.js";
  import { getMe } from "../../../api/orgAndUser";
  import { User } from "../../../api/types/orgAndUser";

  export let expanded;

  let isOpen = writable(expanded ?? window?.innerWidth > 720);

  $: plausibleId = $isOpen ? "sidebar-retract" : "sidebar-expand";
  $: toggleTitle = $isOpen
    ? $_("sidebar.toggleClose")
    : $_("sidebar.toggleOpen");

  let user: User | null = null;

  async function getMeHandler() {
    try {
      user = await getMe();
    } catch {
      user = null;
    }
    return user;
  }

  getMeHandler();
</script>

<div class="toggle" class:expanded={$isOpen} title={toggleTitle}>
  <Hamburger
    class={`plausible-event-name=${plausibleId}`}
    on:click={() => isOpen.update((val) => !val)}
  >
    <div slot="icon">
      {#if $isOpen}
        <SidebarExpand24 />
      {:else}
        <SidebarCollapse24 />
      {/if}
    </div>
  </Hamburger>
</div>
<aside class="sidebar" class:expanded={$isOpen}>
  <header>
    <div class="logo">
      <Logo />
    </div>
  </header>

  <section><DocumentFilters {user} /></section>
  {#if user}
    <section><AddonList /></section>
    <section><ProjectList {user} {browseProjects} {editProject} /></section>
  {/if}
</aside>

<style>
  .sidebar {
    flex: 0 0 auto;
    overflow-y: auto;
    width: 0;
    height: 100%;
    min-height: 100vh;
    -webkit-overflow-scrolling: touch;
    background: var(--sidebar, #edeeef);
    transition: 0s width linear;
  }

  .sidebar.expanded {
    visibility: visible;
    transform: translateX(0);
    width: var(--sidebar-width, 272px);
  }

  header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    min-width: 13.375rem;
  }

  header .logo {
    flex: 0 0 auto;
  }

  section {
    margin-bottom: 1.5rem;
  }

  .toggle {
    display: inline-block;
    position: fixed;
    top: 1rem;
    left: 0.5rem;
    z-index: var(--hamburgerZ);
    fill: var(--darkgray);
    opacity: 0.7;
  }

  .toggle:hover {
    opacity: 1;
  }

  .toggle.expanded {
    left: calc(var(--sidebar-width, 272px) + 0.5rem);
  }

  @media only screen and (max-width: 720px) {
    .sidebar {
      visibility: hidden;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100%;
      transform: translateX(-100%);
    }
    .sidebar.expanded {
      transform: translateX(0);
      width: 100vw;
      z-index: var(--sidebarZ);
    }
    .toggle.expanded {
      left: unset;
      right: 1rem;
    }
  }
</style>
