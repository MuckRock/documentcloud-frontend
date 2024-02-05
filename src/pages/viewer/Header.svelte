<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    ChevronLeft24,
    SidebarCollapse24,
    SidebarExpand24,
  } from "svelte-octicons";
  import { createEventDispatcher } from "svelte";

  import Loader from "../../common/Loader.svelte";

  import Search from "./controls/Search.svelte";
  import Hamburger from "../../common/Hamburger.svelte";

  import { HEADER_HEIGHT } from "./constants.js";

  export let document: any;
  export let loaded: boolean;
  export let title = true;
  export let showOrg = true;
  export let disableControls = false;
  export let embed = false;
  export let sidebarOpen: boolean;

  const dispatch = createEventDispatcher();

  function goBack(e) {
    window.history.back();
  }
</script>

<header
  class="vheader"
  class:disabled={disableControls}
  style="height: {HEADER_HEIGHT}px"
>
  {#if !embed}
    <div class="action back">
      <a class="back" href="/app" on:click|preventDefault={goBack}>
        <ChevronLeft24 />
      </a>
    </div>
  {/if}
  <div class="title">
    {#if loaded}
      {#if !embed && document.readable}
        <Loader active={true} pad={true} />
      {/if}
      {#if title}
        <h1 title={document.title} class:padleft={embed}>{document.title}</h1>
        <h2>
          {$_("titleHeader.contributedBy", {
            values: {
              name: showOrg ? document.orgString : document.userOrgString,
            },
          })}
        </h2>
      {/if}
    {/if}
  </div>
  <div class="action search">
    <Search />
  </div>
  <div class="action sidebar">
    <Hamburger
      class="plausible-event-name=viewer-hamburger"
      on:click={(e) => dispatch("toggle.sidebar")}
    >
      <span slot="icon"
        >{#if sidebarOpen}<SidebarCollapse24 />{:else}<SidebarExpand24
          />{/if}</span
      >
    </Hamburger>
  </div>
</header>

<style>
  header {
    z-index: var(--viewerHeaderZ);
    position: relative;
    border-bottom: var(--viewerHeaderBorder);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }

  header.disabled {
    pointer-events: none;
    filter: brightness(90%);
  }

  .action {
    flex: 0 0 auto;
  }

  .title {
    flex: 1 1 auto;
    color: var(--viewerFg, rgba(0, 0, 0, 0.8));
    user-select: none;
    overflow: hidden;
  }

  .title > * {
    margin: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .title h1 {
    font-size: 14px;
  }

  .title h2 {
    color: var(--viewerSecondary, rgba(0, 0, 0, 0.78));
    font-size: 11px;
    font-weight: normal;
  }
</style>
