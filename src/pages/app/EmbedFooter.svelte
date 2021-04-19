<script>
  import Paginator from "./Paginator";
  import Logo from "@/common/Logo";

  export let dialog = false;
</script>

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
      float: right;
      margin-top: 5px;

      :global(svg) {
        height: 20px;
      }
    }
  }
</style>

<div class="footer" class:dialog>
  <div class="background" />
  <div class="paginator">
    <Paginator {dialog} />
  </div>
  {#if !dialog}
    <div class="logo">
      <Logo newPage={true} nopadding={true} homeLink={true} />
    </div>
  {/if}
</div>
