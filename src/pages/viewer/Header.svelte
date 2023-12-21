<script lang="ts">
  import { _ } from "svelte-i18n";
  import { ChevronLeft24 } from "svelte-octicons";
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
  <div class="vcontent">
    <!-- Expanding cell to hold title and optional back -->
    <div class="cell">
      {#if !embed}
        <div class="back">
          <Link back={true}>
            <ChevronLeft24 />
          </Link>
        </div>
      {/if}
    </div>
    <div class="cell expand">
      {#if loaded}
        <div class="title">
          {#if !embed && document.readable}
            <Loader active={true} pad={true} />
          {/if}
          {#if title}
            <h1 class:padleft={embed}>{document.title}</h1>
            <h2>
              {$_("titleHeader.contributedBy", {
                values: {
                  name: showOrg ? document.orgString : document.userOrgString,
                },
              })}
            </h2>
          {/if}
        </div>
      {/if}
    </div>
    <div class="cell">
      <Search />
    </div>
    <div class="cell">
      <Hamburger
        class="plausible-event-name=viewer-hamburger"
        on:click={(e) => dispatch("toggle.sidebar")}
      />
    </div>
  </div>
</header>

<style>
  header {
    z-index: var(--viewerHeaderZ);
    position: relative;
    border-bottom: var(--viewerHeaderBorder);
    box-shadow: 0 0 25px rgba(0, 0, 0, 0.35);
  }
  header.disabled {
    pointer-events: none;
    filter: brightness(90%);
  }
  .expand {
    width: 100%;
  }

  .cell {
    display: table-cell;
    vertical-align: middle;
  }

  .back {
    margin: 0 16px 0 16px;
  }

  .title {
    color: var(--viewerFg, rgba(0, 0, 0, 0.8));
    user-select: none;
  }
  .title > * {
    display: inline-block;
    margin: 0;
  }

  .title h1 {
    font-size: 18px;
    margin: 0 5px;
    word-break: break-all;
  }

  .title .padleft {
    margin-left: 30px;
  }

  .title h2 {
    color: var(--viewerSecondary, rgba(0, 0, 0, 0.78));
    font-size: 14px;
    font-weight: normal;
    margin: 0 5px;
  }
</style>
