<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronLeft24, SidebarExpand24 } from "svelte-octicons";
  import { createEventDispatcher } from "svelte";

  import Loader from "../../common/Loader.svelte";
  import Link from "../../router/Link.svelte";

  import Search from "./controls/Search.svelte";
  import Hamburger from "../../common/Hamburger.svelte";

  import { HEADER_HEIGHT } from "./constants.js";

  export let document: any;
  export let loaded: boolean;
  export let title = true;
  export let showOrg = true;
  export let disableControls = false;
  export let embed = false;

  const dispatch = createEventDispatcher();
</script>

<header
  class="vheader"
  class:disabled={disableControls}
  style="height: {HEADER_HEIGHT}px"
>
  {#if !embed}
    <div class="action back">
      <Link back={true}>
        <ChevronLeft24 />
      </Link>
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
      <SidebarExpand24 slot="icon" />
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
