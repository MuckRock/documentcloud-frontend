<script>
  // Components
  import Documents from "./Documents";
  import Hamburger from "@/common/Hamburger";
  import Button from "@/common/Button";
  import Modal from "@/common/Modal";
  import ErrorModal from "@/common/ErrorModal";
  import ConfirmDialog from "@/common/dialog/ConfirmDialog";
  import RenameDialog from "@/common/dialog/RenameDialog";
  import AccessDialog from "@/common/dialog/AccessDialog";
  import DataDialog from "@/common/dialog/DataDialog";
  import ProjectDialog from "@/common/dialog/ProjectDialog";
  import CollaboratorDialog from "@/common/dialog/CollaboratorDialog";
  import ProjectAccessDialog from "@/common/dialog/ProjectAccessDialog";
  import Toasts from "@/common/Toasts";

  import {
    layout,
    hideRename,
    hideAccess,
    hideData,
    hideProject,
    hideCollaborators,
    projectCollaboratorAccessOpen,
    hideProjectCollaboratorAccess
  } from "@/manager/layout";
  import { confirmDialog, hideConfirm } from "@/manager/confirmDialog";
  import { documents } from "@/manager/documents";
  import { nav } from "@/router/router";

  import emitter from "@/emit";

  export let concealed = false;

  const emit = emitter({
    expandSidebar() {}
  });

  function refresh() {
    nav("app");
    window.location.reload();
  }
</script>

<style lang="scss">
  .main {
    position: absolute;
    left: $sidebar-width;
    right: 0;
    top: 0;
    bottom: 0;
    overflow: auto;

    @media only screen and (max-width: $mobileBreak) {
      left: 0;

      &.concealed {
        display: none;
      }
    }
  }

  .container {
    padding: 0 48px $mainDocContainerPadding 48px;

    &.error {
      padding: 100px;

      .status {
        color: $caution;
        font-weight: bold;
      }
    }
  }
</style>

<div class="main" class:concealed>
  <Toasts />

  {#if $layout.error}
    <ErrorModal store={$layout} />
  {:else if $confirmDialog.open}
    <Modal component={ConfirmDialog} on:close={hideConfirm} />
  {:else if $layout.renameOpen}
    <Modal component={RenameDialog} on:close={hideRename} />
  {:else if $layout.accessOpen}
    <Modal component={AccessDialog} on:close={hideAccess} />
  {:else if $layout.dataOpen}
    <Modal component={DataDialog} on:close={hideData} />
  {:else if $layout.projectCollaboratorAccessOpen}
    <Modal
      component={ProjectAccessDialog}
      on:close={hideProjectCollaboratorAccess} />
  {:else if $layout.projectCollaboratorsOpen}
    <Modal component={CollaboratorDialog} on:close={hideCollaborators} />
  {:else if $layout.projectOpen}
    <Modal component={ProjectDialog} on:close={hideProject} />
  {/if}
  <Hamburger on:toggle={emit.expandSidebar} />
  {#if !$documents.error}
    <div class="container">
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
