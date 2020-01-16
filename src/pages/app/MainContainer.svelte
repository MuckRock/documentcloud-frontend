<script>
  // Components
  import SearchBar from "./SearchBar";
  import Documents from "./Documents";
  import Hamburger from "@/common/Hamburger";
  import Button from "@/common/Button";
  import Modal from "@/common/Modal";
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import RenameDialog from "@/common/dialog/RenameDialog";
  import AccessDialog from "@/common/dialog/AccessDialog";

  import { layout, hideRename, hideAccess } from "@/manager/layout";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";

  import emitter from "@/emit";

  const emit = emitter({
    expandSidebar() {}
  });

  let filter = "";

  function refresh() {
    window.location.reload();
  }

  function handleSearch({ detail }) {
    filter = detail;
  }
</script>

<style lang="scss">
  .main {
    position: absolute;
    left: $sidebar-width;
    right: 0;
    top: 0;

    @media only screen and (max-width: 600px) {
      left: 0;
    }
  }

  .container {
    padding: 36px 48px;

    &.error {
      padding: 100px;

      .status {
        color: $caution;
        font-weight: bold;
      }
    }
  }
</style>

<div class="main">
  {#if $confirmDialog.open}
    <Modal component={ConfirmDialog} on:close={hideConfirm} />
  {:else if $layout.renameOpen}
    <Modal component={RenameDialog} on:close={hideRename} />
  {:else if $layout.accessOpen}
    <Modal component={AccessDialog} on:close={hideAccess} />
  {/if}
  <Hamburger
    on:toggle={emit.expandSidebar}
    white={true}
    style="margin-top: 16px; padding: 1.5em 36px;" />
  {#if !$layout.error}
    <div class="container">
      <SearchBar on:search={handleSearch} />
      <Documents />
    </div>
  {:else}
    <div class="container error">
      <p class="status">Error</p>
      <p>
        We could not reach the DocumentCloud server. Please try refreshing the
        page later.
      </p>
      <div>
        <Button secondary={true} on:click={refresh}>Refresh</Button>
      </div>
    </div>
  {/if}
</div>
