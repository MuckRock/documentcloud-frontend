<script>
  import Paginator from "../../common/Paginator.svelte";
  import Logo from "@/common/Logo.svelte";

  export let dialog = false;
  import { search, searchNext, searchPrev } from "@/search/search.js";
</script>

<div class="footer" class:dialog>
  <div class="background" />
  <div class="paginator">
    <Paginator
      page={$search.page}
      totalPages={$search.results.numPages}
      on:next={searchNext}
      on:previous={searchPrev}
      has_next={$search.hasNext}
      has_previous={$search.hasPrev}
    />
  </div>
  {#if !dialog}
    <div class="logo">
      <Logo newPage={true} nopadding={true} homeLink={true} />
    </div>
  {/if}
</div>

<style lang="scss">
  .footer {
    position: sticky;
    bottom: 0;
    padding: 10px 0;

    &.dialog {
      position: relative;
    }

    .background {
      position: absolute;
      background: white;
      border-top: solid 1px $gray;
      left: -48px;
      bottom: 0;
      top: 0;
      right: -48px;
      z-index: -1;
    }

    .paginator,
    .logo {
      display: inline-block;
      vertical-align: middle;
    }

    .paginator {
      align-self: center;
    }

    .logo {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 0.5rem;

      :global(svg) {
        box-sizing: border-box;
        height: 20px;
      }
    }
  }
</style>
